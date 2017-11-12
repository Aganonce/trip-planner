
# coding: utf-8

# In[3]:


import pandas as pd
import numpy as np


# In[4]:


data_airlines = pd.read_csv("airline_codes.txt", sep = ',')


# In[15]:


def get_airline_name(two_letter_code):
    return data_airlines[data_airlines['Code2'] == two_letter_code]['Name'].values[0]


# In[14]:


get_airline_name('AA')


# In[ ]:




