{
	"translatorID": "b1e6880d-d763-4fb3-a36e-12f4ec0fce05",
	"label": "ElevenPaths",
	"creator": "febrezo",
	"target": "https?://(www.)?elevenpaths.com",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 1000,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gc",
	"lastUpdated": "2016-08-28 03:56:23"
}

/*
	ElevenPaths Translator
	Copyright (C) 2016 Félix Brezo, felixbrezo@gmail.com
	
	This program is free software: you can redistribute it and/or modify
	it under the terms of the Affero GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.
	
	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.
	
	You should have received a copy of the Affero GNU General Public License
	along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/


function detectWeb(doc, url) {
	Zotero.debug("Starting detectWeb...");
	if ( url.indexOf('/elevenpaths-talks')>-1 ) {
		Zotero.debug("This is --> ElevenPaths Talks");
		return "talks";
	} else if ( url.indexOf('/cybersecurity-pulse')>-1 ) {
		Zotero.debug("This is --> CyberSecurity Pulse");
		return "pulse";
	} else if ( url.indexOf('/news-events/')>-1 )  	{
		Zotero.debug("This is --> MULTIPLE");
		return "multiple";
	} else {
		Zotero.debug("This is --> Reports");
		return "report";
	} 
}

// More item types available at: <http://gsl-nagoya-u.net/http/pub/csl-fields/index.html>
// Sample report found at:
/* 
	{
		"itemType": "report",
		"title": "",
		"creators": [
			{
				"creatorType": "author",
				"firstName": "",
				"lastName": ""
			}
		],
		"abstractNote": "",
		"reportNumber": "",
		"reportType": "",
		"seriesTitle": "",
		"place": "",
		"institution": "",
		"date": "",
		"pages": "",
		"language": "",
		"shortTitle": "",
		"url": "",
		"accessDate": "",
		"archive": "",
		"archiveLocation": "",
		"libraryCatalog": "",
		"callNumber": "",
		"rights": "",
		"extra": "",
		"tags": [],
		"collections": [],
		"relations": {}
	}
*/

function doWeb(doc, url) {
	// Setting folder
	folderPath = url.substr(0,url.lastIndexOf('/'));
	
	Zotero.debug("=================================");
	Zotero.debug("Starting doWeb...");
	Zotero.debug("Full URL: " + url);
	Zotero.debug("Path URL: " + folderPath);
	Zotero.debug("---------------------------------");	
	
	// IDentifying global type
	type = detectWeb(doc, url);
	
	if ( type == "multiple") {
		Zotero.debug("TO-DO: Process several events.");
		/*
		Zotero.selectItems(getSearchResults(doc, url, false), function (items) {
			if (!items) {
				return true;
			}
			var articles = [];
			for (var i in items) {
				articles.push(i);
			}
			ZU.processDocuments(articles, scrape);
		});*/
	} else if ( type == "talks") {
		Zotero.debug("TO-DO: ElevenPaths Talks item.");
	} else if ( type == "pulse") {		
		Zotero.debug("TO-DO: CyberSecurity Pulse items.");
	} else {
		// Processing any single file
		Zotero.debug("This is definitely a report... Processing it as such:");
		
		// Grabbing attachment info
		var pdfURL = folderPath + "/" + ZU.xpathText(doc, '//div[@class="post-content"]/p/a[@target="_blank"]/@href');
		Zotero.debug("\t- PDF URL: " + pdfURL);

		// Creating the item...
		var newItem = new Zotero.Item("report");
		
		// Defining the URL as the ID
		newItem.itemID = pdfURL; 
		
		// Setting the URL:
		newItem.url = url;
		
		// Getting the title with Xpath expression:
		newItem.title = ZU.xpathText(doc, '//title');
		Zotero.debug("\t- Título: " + newItem.title);
		
		// Setting abstractNote:
		newItem.abstractNote = ZU.xpathText(doc, '//meta[@property="og:description"]/@content');
		Zotero.debug("\t- Descripción: " + newItem.abstractNote);

		//Setting date:
		newItem.date = ZU.xpathText(doc, '//meta[@property="article:published_time"]/@content');
		Zotero.debug("\t- Fecha: " + newItem.date);
		
		//Setting reportType:
		newItem.reportType = findReportType(pdfURL);
		Zotero.debug("\t- Tipo: " + newItem.reportType);
		
		//Setting place:
		newItem.place = "Madrid (España)";
		Zotero.debug("\t- Lugar: " + newItem.place);
		
		// Getting the Author
		//var author = ZU.xpathText(doc, '//div[@class="post-meta"]/span');
		newItem.creators = [Zotero.Utilities.cleanAuthor("ElevenPaths", "author", false)];
		//newItem.creators = [{"creatorType": "author", "firstName": "ElevenPaths", "lastName": "ElevenPaths"}];
		Zotero.debug("\t- Autores: " + newItem.creators);
		
		// Adding the attachment
		newItem.attachments.push({
			title: pdfURL.substr(pdfURL.lastIndexOf('/')+1),
			mimeType:"application/pdf",
			url:pdfURL
		});
		
		// Adding tags
		newItem.tags = ZU.xpathText(doc, '//meta[@name="keywords"]/@content').split(","); 
		
		newItem.complete();
		
		// TODO: creating collection
		/*
		Zotero.debug("---------------------------------");	
		Zotero.debug("Creating the collection...");
		Zotero.debug("---------------------------------");	
		
		var collection = new Zotero.Collection();
		collection.name = "Test Collection";
		collection.type = "collection";
		
		//Appending the item using the id
		collection.children = [{type:"item", id:newItem.itemID}];
		
		// Commiting the collection
		collection.complete();*/
		Zotero.debug("=================================");
	}
}

// Identifying the type of the report:
//	- CyberSecurity Shot_
// 	- CyberSecurity Avatar_
// 	- ElevenPaths Discovers_
// 	- Trend Report
function findReportType(filename) {
	Zotero.debug("Trying to detect type of report...");
	if ( filename.indexOf('CyberSecurity_Shot')>-1 ) 	{
		Zotero.debug("This is --> CyberSecurity_Shot");
		return "CyberSecurity Shot_";
	} else if ( filename.indexOf('CyberSecurity_Avatar')>-1 ) {
		Zotero.debug("This is --> CyberSecurity_Avatar");
		return "CyberSecurity Avatar_";
	} else if ( filename.indexOf('ElevenPaths_Discover')>-1 ) 	{
		Zotero.debug("This is --> ElevenPaths_Discovers");
		return "ElevenPaths Discovers_";
	}  else if ( filename.indexOf('Trend_Report')>-1 ) 	{
		Zotero.debug("This is --> Trend Report");
		return "Trend Report";
	} 	
	return "OTHER";
}

/*function processAvatar(tmpItem) {
	return tmpItem;
}

function processDiscovers(tmpItem) {
	return tmpItem;
}
function processPulse(tmpItem) {
	return tmpItem;
}

function processShot(tmpItem) {
	return tmpItem;
}*/

function scrape(doc, url) {
	// New
	
	/*urlBibtex = url.replace('/article/view/', '/rt/captureCite/');
	if (!/\/article\/view\/.+\/.+/.test(url)) {
		urlBibtex += '/0';
	}
	urlBibtex += '/BibtexCitationPlugin';
	//Z.debug(urlBibtex);
	ZU.doGet(urlBibtex, function(text) {
		var parser = new DOMParser();
		var xml = parser.parseFromString(text, "text/html");
		var bibtex = ZU.xpathText(xml, '//pre');
		if (bibtex) {
			var translator = Zotero.loadTranslator("import");
			translator.setTranslator("9cb70025-a888-4a29-a210-93ec52da40d4");
			translator.setString(text);
			translator.setHandler("itemDone", function(obj, item) {
				item.attachments.push({
					title: "Snapshot",
					document: doc
				});
				item.complete();
			});
			translator.translate(); 
		} 
		
	});*/
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://www.elevenpaths.com/fuga-de-informacion-del-comite-de-campana-democrata-del-congreso-de-eeuu-2/index.html#",
		"items": [
			{
				"itemType": "report",
				"title": "Fuga de información del Comité de Campaña Demócrata del Congreso de EEUU",
				"creators": [
					{
						"firstName": "",
						"lastName": "ElevenPaths",
						"creatorType": "author"
					}
				],
				"date": "2016-08-26T07:36:15Z",
				"abstractNote": "El nuevo blanco de filtraciones de datos ha sido el partido Demócrata de EE.UU. Los datos expuestos son de carácter personal, además de la información de contacto de sus asesores de campaña. Nuestro equipo de analistas de inteligencia te cuentan todo el detalle de este último caso.",
				"itemID": "https://www.elevenpaths.com/fuga-de-informacion-del-comite-de-campana-democrata-del-congreso-de-eeuu-2/../wp-content/uploads/2016/08/CyberSecurity_Shot_DCCC_v1_0_ES.pdf",
				"libraryCatalog": "ElevenPaths",
				"place": "Madrid (España)",
				"reportType": "CyberSecurity Shot_",
				"url": "https://www.elevenpaths.com/fuga-de-informacion-del-comite-de-campana-democrata-del-congreso-de-eeuu-2/index.html#",
				"attachments": [
					{
						"title": "CyberSecurity_Shot_DCCC_v1_0_ES.pdf",
						"mimeType": "application/pdf"
					}
				],
				"tags": [
					"analistas",
					"comité de campaña demócrata del congreso",
					"cybersecurity",
					"cybershot",
					"eeuu",
					"elevenpaths",
					"fuga de informacón",
					"partido demócrata",
					"shot"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.elevenpaths.com/investigation-report-on-bozkurt-hackers-cyber-identity/index.html",
		"items": [
			{
				"itemType": "report",
				"title": "Investigation report on “Bozkurt Hackers” cyber identity",
				"creators": [
					{
						"firstName": "",
						"lastName": "ElevenPaths",
						"creatorType": "author"
					}
				],
				"date": "2016-07-01T07:57:24Z",
				"abstractNote": "Nuestro equipo de analistas descubren los perfiles manejados en las redes sociales por el grupo \"Bozkurt Hackers\" así como los foros de la DeepWeb que utilizan para vender la información robada. ¡Descárgate el informe!",
				"itemID": "https://www.elevenpaths.com/investigation-report-on-bozkurt-hackers-cyber-identity/../wp-content/uploads/2016/06/CyberSecurity_Avatar_Bozkurt_Hackers_v1_0_EN.pdf",
				"libraryCatalog": "ElevenPaths",
				"place": "Madrid (España)",
				"reportType": "CyberSecurity Avatar_",
				"url": "https://www.elevenpaths.com/investigation-report-on-bozkurt-hackers-cyber-identity/index.html",
				"attachments": [
					{
						"title": "CyberSecurity_Avatar_Bozkurt_Hackers_v1_0_EN.pdf",
						"mimeType": "application/pdf"
					}
				],
				"tags": [
					"",
					"analyst",
					"bozkurt hackers",
					"cyberavatar",
					"cybersecurity avatar",
					"deepweb",
					"hackers",
					"informe",
					"report",
					"tor"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.elevenpaths.com/financial-cyber-threats-q2-2016/index.html",
		"items": [
			{
				"itemType": "report",
				"title": "Trend Report: “Financial cyber threats Q2 2016″ conducted by Kaspersky Labs and Telefónica",
				"creators": [
					{
						"firstName": "",
						"lastName": "ElevenPaths",
						"creatorType": "author"
					}
				],
				"date": "2016-08-11T10:59:47Z",
				"abstractNote": "The ElevenPaths’ Analyst Team gives you a quarterly update on the latest tendencies of cyber attacks in financial sector. You can now download the full Financial CyberThreats Q2 2016 Report conducted by Kaspersky Labs and the our analyst team.",
				"itemID": "https://www.elevenpaths.com/financial-cyber-threats-q2-2016/../wp-content/uploads/2016/08/Trend_Report_Financial_Threats_Q2_2016_v1_0_EN.pdf, https://www.elevenpaths.com/new-report-financial-threats-report-q1-2016-conducted-by-kaspersky-labs-and-telefonica/index.html",
				"libraryCatalog": "ElevenPaths",
				"place": "Madrid (España)",
				"reportType": "Trend Report",
				"shortTitle": "Trend Report",
				"url": "https://www.elevenpaths.com/financial-cyber-threats-q2-2016/index.html",
				"attachments": [
					{
						"title": "index.html",
						"mimeType": "application/pdf"
					}
				],
				"tags": [
					"2016",
					"analyst",
					"cyber attacks",
					"cyberintelligence reports",
					"eleven paths",
					"elevenpaths",
					"financial sector",
					"kaspersky",
					"kaspersky labs",
					"q2",
					"trend report"
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/