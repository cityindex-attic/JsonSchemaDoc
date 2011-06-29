var ciConfig=ciConfig||{};
ciConfig.ssmd = {
    "HTTP-SSM-Version": "0.1",
    "version": "1",
    "target": "http://pushpreprod.cityindextest9.co.uk/",
    "schema": "http://ciapipreprod.cityindextest9.co.uk/TradingApi/schema?includeDemoValue=true",
    "description": "City Index Streaming API v1",
    "streams": {
        "NewsHeadlines": {
            "description": "Stream of current news headlines.  Try NEWS.MOCKHEADLINES.UK for a mock stream",
            "endpoint": "CITYINDEXSTREAMING", 
            "channel": "NEWS.HEADLINES.{category}", 
            "transport": "HTTP", 
            "protocol": "lightstreamer-3.6", 
            "messageType": {
                "$ref": "#.NewsDTO"
            },
            "group": "Streaming API",
            "parameters": [
                {
                    "type": "string",
                    "name": "category",
                    "description": "A news category",
                    "minLength": 1,
                    "maxLength": 100,
                    "demoValue": "UK"
                }
            ]
        },
        "Prices": {
            "description": "Stream of current prices. Try PRICES.PRICE.154297 (GBP/USD (per 0.0001) CFD) which prices Mon - Fri 24hrs",
            "endpoint": "CITYINDEXSTREAMING", 
            "channel": "PRICES.PRICE.{marketId}", 
            "transport": "HTTP", 
            "protocol": "lightstreamer-3.6", 
            "messageType": {
                "$ref": "#.PriceDTO"
            },
            "group": "Streaming API",
            "parameters": [
               {
                    "type": "string",
                    "name": "marketId",
                    "description": "The marketId",
                    "demoValue": "71442"
                }
            ]
        },
        "ClientAccountMargin": {
            "description": "Stream of clients current margin",
            "endpoint": "CLIENTACCOUNT", 
            "channel": "ALL", 
            "transport": "HTTP", 
            "protocol": "lightstreamer-3.6", 
            "messageType": {
                "$ref": "#.ClientAccountMarginDTO"
            },
            "group": "Streaming API"
        },
        "Quotes": {
            "description": "Stream of quotes",
            "endpoint": "TRADINGACCOUNT", 
            "channel": "QUOTE.ALL", 
            "transport": "HTTP", 
            "protocol": "lightstreamer-3.6", 
            "messageType": {
                "$ref": "#.QuoteDTO"
            },
            "group": "Streaming API"
        }
    }
};