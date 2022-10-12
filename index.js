// ==========================================================================> LISTE DES INSTANCES UTILISES
// Listes des instances
const { Client, Intents, MessageEmbed } = require('discord.js'); // instance discord
const cron = require('cron'); // instance de temps
const { token, channelPerso} = require('./config.json'); // Importation des accès

// Liste des variables
const bot = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES] }); // Client utilisés
let isOpen = false; // Booléen qui permet de savoir si l'ETIQ est ouverte
let channel; // channel
let date = new Date(); // Date actuelle
let actualTime = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()} | `;

// ==========================================================================> LANCE LE BOT
StartBot();
reponseMessage();
CloseBotAt();
bot.login(token)

// ==========================================================================> LISTES DES FONCTIONS UTILISES POUR FAIRE FONCTIONNIER LE BOT ETIQ
/**Lance le bot
 * @author Damien Chabret
 */
 function StartBot(){
    bot.on('ready', () => {
        // Message ETIQ ouvert
        let openEmbed = new MessageEmbed()
        .setColor('#1CA007')
        .setTitle("L'ETIQ est ouvert !")
        .setDescription("Viens à l'ETIQ !")
        .setThumbnail('https://zupimages.net/up/22/11/z8io.png');

        console.log('>> Ready to use.');
        isOpen = true;
        channel = bot.channels.cache.get(channelPerso);
        channel.bulkDelete(100);
        channel.send({ embeds: [openEmbed]});
        bot.user.setPresence({status: 'online',activities: [{name:'LOCAL : OPEN',type:'COMPETING',url:'https://etiq-dijon.fr'}]})
        console.log("Etiq is open 🟢");
    })
 }

/**Créer un message selon le message envoyé
 * @author Damien Chabret
 */
 function reponseMessage(){
    // Si un message est reçu
    bot.on('messageCreate', async (message) => { 
        channel = bot.channels.cache.get(channelPerso);
        message.content = message.content.toLowerCase();

        // Transforme l'abréviation en complet
        if(message.content == "e! o"){
            message.content = "e! open";
        }
        else if(message.content == "e! c"){
            message.content = "e! close";
        }

        switch(message.content){
            // Commande help 
            case "e! help":
                CommandHelpBot(message);
                break;
            // Ouvrir l'ETIQ
            case "e! open":
                CommandOpenBot(message);
                break;
            // Fermer l'ETIQ
            case "e! close":
                CommandCloseBot(message);
                break;
            // message test
            case "test":
                console.log(message.content);
                break;
        }
    });
 }

 /**Commande "Help" qui envoie un message privée avec la liste des commandes
 * @author Damien Chabret
 */
function CommandHelpBot(message){
    // Message
    let helpEmbed = new MessageEmbed()
    .setColor('#0099ff')
    .setTitle('Commandes du bot')
    .setDescription("Vous pourrez retrouver toutes les commandes du bots afin de pouvoir au mieux l'utiliser.\n")
    .setThumbnail('https://www.etiq-dijon.fr/assets/images/logo.png')
    .addFields(
        { name: '>> e! help', value: 'Demande la liste des commandes du bot.', inline: false },
        { name: '>> e! open  / e! o', value: "Permet d'indiquer que le local est ouvert.", inline: false },
        { name: '>> e! close / e! c', value: "Permet d'indiquer que le local est fermé.", inline: false }
    )

    // Envoie du message
    message.delete(message);
    message.author.send({ embeds: [helpEmbed] });
}

/**Commande "Open" qui indique que le local est ouvert
 * @author Damien Chabret
 */
async function CommandOpenBot(message){
    // Message ETIQ ouvert
    let openEmbed = new MessageEmbed()
    .setColor('#1CA007')
    .setTitle("L'ETIQ est ouvert !")
    .setDescription("Viens à l'ETIQ !")
    .setThumbnail('https://zupimages.net/up/22/11/z8io.png')

    // Ouvre l'ETIQ
    if(isOpen == false){
        if(message != null){
            message.delete(message);
        }
        channel.bulkDelete(100);
        await channel.send({ embeds: [openEmbed]});
        bot.user.setPresence({status: 'online',activities: [{name:'LOCAL : OPEN',type:'COMPETING',url:'https://etiq-dijon.fr'}]})
        console.log(`>> ${actualTime} Etiq is open 🟢`);
        isOpen = true;
    }
}

/**Commande "Close" qui indique que le local est fermé
 * @author Damien Chabret
 */
async function CommandCloseBot(message){
    // Message ETIQ fermé
    let closeEmbed = new MessageEmbed()
    .setColor('#FF1A03')
    .setTitle("L'Etiq est fermé !")
    .setDescription("C'est fermé !")
    .setThumbnail('https://zupimages.net/up/22/11/f6fi.png');

    // Ferme l'ETIQ
    if(isOpen == true){
        if(message != null){
            message.delete(message);
        }
        channel.bulkDelete(100);
        await channel.send({ embeds: [closeEmbed]});
        bot.user.setPresence({status: 'dnd',activities: [{name:'LOCAL : CLOSE',type:'COMPETING',url:'https://etiq-dijon.fr'}]})
        console.log(`>> ${actualTime} Etiq is close 🔴`);
        isOpen = false;
    }
}

/** Renvoie les informations de ton acompte 
*
*/
async function AccountInformation(){

}

 /** Ferme l'ETIQ quand il est 18h45 durant la semaine.
  *  @author Damien Chabret
  */
function CloseBotAt(){
    let scheduledMessage = new cron.CronJob('00 45 18 * * *', () => {
        if(date.getDay() != 5 || date.getDay() != 6) // Ne le fait qu'en semaine
            CommandCloseBot();
        })
        scheduledMessage.start();
}