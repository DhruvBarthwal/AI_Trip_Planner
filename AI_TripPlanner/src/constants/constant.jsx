export const SelectBudget = [
    {
        id : 1,
        title : "Cheap",
        desc : "Stay conscious of cost",
        icon : '💵'   
    },
        {
        id : 2,
        title : "Moderate",
        desc : "Keep cost on the average side",
        icon : '💰'
    },
        {
        id : 1,
        title : "Luxury",
        desc : "Don't worry about cost",
        icon : '💸'
    },
]

export const SelectTravelList =[
    {
        id : 1,
        title : "Just ME",
        desc : "A solo travels in exploration",
        icon : '✈',
        people : '1'
    },
        {
        id : 1,
        title : "A couple",
        desc : "Two travels in tandom",
        icon : '🥂',
        people : '2 people'
    },
        {
        id : 1,
        title : "Family",
        desc : "A group of fun loving adv",
        icon : '🏡',
        people : '3 to 5 people'
    },
        {
        id : 1,
        title : "Friends",
        desc : "A bunch of thrill seeks",
        icon : '🛥️',
        people : '5 to 10 people'
    },
]

export const AI_Prompt=`Generate Travel Plan for Location : {location}, for {totalDays} Days for {traveller} with a {budget} budget Give me a Hotels options list with HotelName, Hotel address, Price, hotel image ul, geo coordinates, rating, descriptions and suggest iinerary with placeName, Place Details, Place Image Url Geo Coordinates, ticket Pricing, Time t travel each of the locaton fo 3 days wth each day plan with best time to visit in JSON format`;