const {ActivityType} = require(`discord.js`);

module.exports = {
    name: 'clientReady',
    once: true, //Only run once when the bot starts
    async execute(client) {
        console.log('Ready!');

        //Function to randomly change the bot's presence
        async function pickPresence(){
            const statusArray = [
                {content: "アニメを見る", type: ActivityType.Custom, status: "dnd"},
                {content: "マンガを読む", type: ActivityType.Custom, status: "dnd"},
            ];

            //Pick a random status from the array
            const option = Math.floor(Math.random() * statusArray.length);

            try{      
                //Update the bot's presence         
                await client.user.setPresence({
                    //Set the activity shown on the bot's profile
                    activities: [
                        {
                            name: statusArray[option].content,
                            type: statusArray[option].type,
                        },
                    ],

                    //Set the bot's online status
                    status: statusArray[option].status
                })
            }
            catch(error){
                //Print any errors if setting the presence fails
                console.error(`[ERROR] ${error}`);
            }
        }

        pickPresence(); //Set an initial presence immediately after the bot starts
        setInterval(pickPresence, 1200000); //Set Presence every n seconds
    },
};