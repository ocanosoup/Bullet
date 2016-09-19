#Bullet
An Alexa skill for SMS via [Pushbullet]("https://www.pushbullet.com/") SMS enabled devices

###Examples
"Alexa tell Bullet to send Daniel What's up?"
"Alexa tell Bullet to send a text to Sarah saying when will you be back?"
###Requirements
* [Pushbullet API key](https://www.pushbullet.com/#settings/account "Should be one of the first things on the right hand side once you sign in")
* [Pushbullet SMS enabled Device key](https://docs.pushbullet.com/#send-sms)
* [Pushbullet User ID](https://docs.pushbullet.com/#api-quick-start)

###Please Note
The required fields are the beginning of [skill.js]("https://github.com/ocanosoup/Bullet/blob/master/skill.js#L3")  
There is a custom slot called [QUERY_LIST]("https://github.com/ocanosoup/Bullet/blob/master/speechAssets/QUERY_LIST.txt") filled with phrases  
I used the AMAZON.US_FIRST_NAME built in slot to populate names, this can be extended
for special cases by adding a custom slot and naming it similarly. [More details]("https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/alexa-skills-kit-interaction-model-reference#h2_extend_types")
