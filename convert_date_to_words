from dateutil import parser

def convert_date_to_words(datestr):

    dt = parser.parse(datestr)

    year = str(dt.year)
    month = str(dt.month)
    day = str(dt.day)
    hour = dt.hour
    if hour >= 12:
        ampm = "PM"
    elif hour < 12:
        ampm = "AM"
    if hour > 12:
        hour = hour -12
    hour = str(hour)
    minute = dt.minute
    if minute < 10:
        minute = "0" + str(minute)
    else:
        minute = str(minute)

    month_dict = {}
    nums = range(1,13)
    months_list = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    for i, mon in enumerate(months_list):
        month_dict[str(nums[i])] = months_list[i]
    
    return month_dict[month] + ' ' + day + ' ' + year + ' at ' + hour + ':' + minute + ' ' + ampm
