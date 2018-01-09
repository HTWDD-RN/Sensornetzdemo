# Schnittstellen Beschreibung

## Webseiten-Client zu Frontend-Service
##### GET alle Ressourcen
```JSON
GET HTTP/1.1 /
{
	"response": [
		{
			"id": "29848926adf", // (unique)
			"name": "Node A (LED)",
			"state": "OPEN",
			"actions": [ACTION]
		}
	]
}

ACTION:
{
	"id": "7a867826", // (unique in allen ACTIONs einer Ressource)
	"name": "an-/ausschalten",
	"type": TYPE,
	"parameter": TYPEPARAMETER
}

TYPE:
"SWITCH", "RANGE", "COLOR_RANGE"

TYPEPARAMETER:
	"SWITCH":
		{
			"current": 1,
			"on": 1,
			"off": 0
		}
	
	"RANGE":
		{
			"current": 0.5684923,
			"min": 0,
			"max": 1
		}

	"COLOR_RANGE":
		{
			"current": [127,87,59],
			"min": [0,0,0],
			"max": [255,255,255]
		}
```

##### GET einer Ressource
```JSON
GET HTTP/1.1 /:ressource-id:
{
	"response": {
			"id": "29848926adf", // (unique)
			"name": "Node A (LED)",
			"state": "OPEN",
			"actions": [ACTION]
		}
}
```

##### SET Status einer Ressource
```JSON
PUT HTTP/1.1 /:ressource-id:/:action-id:
SWITCH:
	{
		"value": 0
	}

	response:
	{
		"value": 0
	}

```
