import cherrypy
import os
from cherrypy.process import servers
from bs4 import BeautifulSoup
import urllib
import re
import urllib2
import json
import os.path

def fake_wait_for_occupied_port(host, port): 
	return

servers.wait_for_occupied_port = fake_wait_for_occupied_port

global current_dir
current_dir = os.path.dirname(os.path.abspath(__file__))

def lookup_stn(code):
	for station in stations:
		if re.match(station['code'], code):
			name = station['name']
			break
	return name

stations = []
station = {'name' : "Paddington", "code" : "PAD"}
stations.append(station)
station = {'name' : "St Pancras Intl", "code" : "STP"}
stations.append(station)
station = {'name' : "Euston", "code" : "_Euston"}
stations.append(station)
station = {'name' : "Kings Cross", "code" : "KGX"}
stations.append(station)
station = {'name' : "Waterloo", "code" : "WAT"}
stations.append(station)
station = {'name' : "Bristol Temple Meads", "code" : "BRI"}
stations.append(station)
station = {'name' : "Reading", "code" : "RDG"}
stations.append(station)
station = {'name' : "Yatton", "code" : "YAT"}
stations.append(station)



class Start(object):
	def index(self):
		return "Hello World!"
	def platformdata(self, var=None, **params):
		stn = urllib.quote(cherrypy.request.params['stn'])
		if re.match('^_.*', stn):
			page = urllib2.urlopen("http://www.networkrail.co.uk/LiveDepartureBoards/Default.aspx?stn=%s&display=dep" % stn.lstrip("_"))
			soup = BeautifulSoup(page)
			trains = []
			for t in soup.find_all('tr',  class_="item"):
				train = {}
				dest = t.find(class_="Dest name").string
				time = t.find(class_="Dep").string
				plat = t.find(class_="PlannedPlatform").string
				train['dest'] = dest
				train['time'] = time
				train['ref'] = time + "|" + dest + "|" + stn
				if plat != None:
					train['plat'] = plat
				trains.append(train)
		else:
			page = urllib2.urlopen("http://ojp.nationalrail.co.uk/service/ldbboard/dep/%s" % stn)
			soup = BeautifulSoup(page)
			trains = []
			for tr in soup.find(id="live-departure-board").find('table').find_all('tr'):
				cells = tr.find_all('td')
				if len(cells) != 0:
					train = {}
					train['time'] = cells[0].string
					train['dest'] = cells[1].string.lstrip().rstrip()
					plat = str(cells[3].string)
					if plat != "None":
						train['plat'] = plat
					trains.append(train)
		return json.dumps(trains)
	index.exposed = True
	platformdata.exposed = True

conf = {'/static': {'tools.staticdir.on': True,
                    'tools.staticdir.dir': os.path.join(current_dir, 'static'),
                    'tools.staticdir.content_types': {'webapp': 'application/x-web-app-manifest+json',}}}

cherrypy.config.update({'server.socket_host': '0.0.0.0',})
cherrypy.config.update({'server.socket_port': int(os.environ.get('PORT', '5000')),})
cherrypy.quickstart(Start(), "/", conf)