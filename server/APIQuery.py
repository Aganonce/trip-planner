
# coding: utf-8

# In[17]:

from urllib2 import Request, urlopen, URLError
import json


# In[ ]:

APIKey="61ac3343-782f-40e6-ad1e-d8d14b2f1fe3"
APIRoot="http://api.tripadvisor.com/api/partner/2.0/location/"
LocationID=89575


# In[25]:

def location_idRequest(Key,Root,ID): ##Returns JSON of specific location id
    request=Request(str(Root)+str(LocationID)+"?key="+str(Key))
    try:
        response=urlopen(request)
        response=response.read()
        response=json.loads(response)
        return response
    except URLError,e:
        print "Got Error Code: "
        return e


# In[18]:

query=location_idRequest(APIKey,APIRoot,LocationID)


# In[20]:

print query

