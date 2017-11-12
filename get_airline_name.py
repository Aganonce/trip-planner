
# coding: utf-8

# In[2]:


import pandas as pd
import numpy as np


# In[11]:


data_airlines = pd.read_csv("airline_codes.txt", sep = ',')


# In[16]:


def get_airline_name(two_letter_code):
    return data_airlines[data_airlines['Code2'] == two_letter_code]['Name']


# In[18]:


get_airline_name('AA')


# In[ ]:




