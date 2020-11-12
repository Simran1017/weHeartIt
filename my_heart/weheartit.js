let puppeteer = require("puppeteer");
let fs = require("fs");

let login , pwd , email , tumblr_mail , tumblr_pass , tumblr_msg , p ;
let credentialsFile = process.argv[2] ;
let search = process.argv[3] ;
let num = process.argv[4] ;
let FOLLOW = process.argv[5];

let searchProfile = "stars" ;
let CHOICE = "mychoice" ;
let CATEGORY = "quotes" ;

let ss = "ice cream cones" ;
let collectionName = "MIDNIGHT BLUES" ;
let PICK = collectionName ;
let FRNDS ;

let year = process.argv[6]; //2018
let month = process.argv[7] ; //11
let date = process.argv[8] ; //21
 
(async function (){
    try{
        let data = await fs.promises.readFile(credentialsFile , "utf-8") ;
        let credentials = JSON.parse(data) ;
        login = credentials.login ;
        email = credentials.email ;
        pwd = credentials.pwd ;

        disname = credentials.disname ;
        bio = credentials.bio ;
        loc = credentials.loc ;

        tumblr_mail = credentials.tumblr_mail ;
        tumblr_pass = credentials.tumblr_pass ;
        tumblr_msg = credentials.tumblr_msg ;

        p = credentials.p ;

        let browser = await puppeteer.launch({
            headless: false,
            defaultViewport: null,
            args: ["--start-maximized", "--disable-notifications"] ,
        });

        
        let numberofPages = await browser.pages() ;

        let tab = numberofPages[0] ;
    
        await Login(tab , login , pwd , email) ;

        await tab.waitForSelector(".icon.icon-home") ;
        await tab.click(".icon.icon-home") ;

        await Search(tab) ;

        await Follow(tab) ;

        await tab.waitForSelector(".icon.icon-home") ;
        await tab.click(".icon.icon-home") ;

        await screenShot(tab) ;  
        await updateProfile(tab) ; 
 
        await tab.waitForSelector(".icon.icon-home") ;
        await tab.click(".icon.icon-home") ;
        
        await changeCoverPhoto(tab) ;

        await Discover(tab) ;

        await tab.waitFor(200) ;
          
        await addToCollections(tab) ;

        await tab.waitForSelector(".icon.icon-article") ;
        await tab.click(".icon.icon-article") ;
       
    
        await Article(tab) ;

        await share(tab) ;

        const tab1 = await browser.newPage();
        await tab1.goto(FRNDS,{
            waitUntil : "networkidle2"
        }) ;
  
        await fb(tab1) ;

        await tab.waitFor(200) ;

        await tab.waitForSelector(".btn.btn-link.position-top-right.js-modal-close") ;  
        //click on cross
        await tab.click(".btn.btn-link.position-top-right.js-modal-close") ; 

        await tab.waitFor(300) ;

        await tab.close() ;
      
     }
     catch(err){
        console.log(err.message) ;
     }

})();

async function Login(tab , login , pwd , email){

    try
    {   await tab.goto(login , {
            waitUntil : "networkidle2"
        }) ;

        // await tab.waitForSelector(".btn.btn-small.text-primary.js-login") ;
        // await tab.click(".btn.btn-small.text-primary.js-login") ;

        await tab.waitForSelector("#user_email_or_username") ;
        await tab.type("#user_email_or_username" , email , {delay:150}) ;

        await tab.waitForSelector("#user_password_login") ;
        await tab.type("#user_password_login" , pwd , {delay:150}) ;

        await tab.waitForSelector("input[type='submit']") ;
        await tab.click("input[type='submit']") ;

    }catch(err)
    {
        console.log(err.message) ;
    } 
}

async function updateProfile(tab){
    
    try
    {   await tab.waitForSelector("#current_user") ;
        await tab.click("#current_user" , {visible:true}) ;

        let link = await tab.waitForSelector("a[href='/settings']");

        let link2 = await tab.evaluate(function(a){
            return a.href ;
        },link) ;
        
        console.log(link2) ;
        
        await tab.goto(link2, {
            waitUntil: "networkidle2"
        });

        await tab.waitForSelector("#user_name") ;
        await clear(tab,"#user_name") ;
        await tab.type("#user_name" , disname , {delay:120}) ;

        await tab.waitForSelector("#user_bio") ;
        await clear(tab,"#user_bio")
        await tab.type("#user_bio" , bio , {delay:100}) ;
    
        await tab.waitForSelector("#user_location") ;
        await clear(tab,"#user_location") ;
        await tab.type("#user_location" , loc , {delay:100}) ;

        await tab.waitForSelector("input[name='commit']") ;
        await tab.click("input[name='commit']") ;

        await uploadFile(tab) ;
    
    }catch(err)
    {
        console.log(err.message) ;
    }
}

async function Article(tab){

    try{                        
            let url = `https://weheartit.com/discover/articles/${CATEGORY}` ; //for article type

            let Link = await tab.waitForSelector(`a[href='/discover/articles/${CATEGORY}']`) ;
    
            let Link2 = await tab.evaluate(function(a){
                return a.href ;
            },Link);

            console.log(Link2) ;

            await tab.goto(Link2,{
                waitUntil:"networkidle2"
            }) ;
        
        let idx = 0;

        do{
            await tab.waitForSelector("a.overlay.js-blc.js-blc-t-article");        
            let total = await tab.$$("a.overlay.js-blc.js-blc-t-article"); //list of articles
            let index = idx ;
            for(let i=0;i<=index+9;i++){
                await tab.keyboard.press('ArrowDown');
                }

            console.log( (idx+1) + " evaulated");
                       
            let single = total[idx];

                let link = await tab.evaluate(function(a){
                    return a.href;
                },single);

                await tab.goto(link,{
                    waitUntil:"networkidle2" 
                }) ;

                await tab.waitForSelector("a.entry.js-blc.js-blc-t-heart.btn-heart.btn.btn-link.js-heart-button");
                await tab.click("a.entry.js-blc.js-blc-t-heart.btn-heart.btn.btn-link.js-heart-button");
                
                await tab.goto(url ,{
                        waitUntil:"networkidle2"
                }) ;
                
                idx++;
            }while(idx<4);
            console.log("ALL ARTICLES LIKED") ;
        }catch(err)
        {
            console.log(err.message) ;
        }   
}

async function Search(tab){

    await tab.waitForSelector("#text") ;
    await tab.type('#text' , search , {delay:150} ) ;
    await tab.keyboard.press("Enter") ;

 //   await Like(tab) ;

}

async function Like(tab){

    await tab.waitForSelector(".entry.js-blc.js-blc-t-heart.btn-heart.btn.btn-heart-circle.js-heart-button") ;
    let Arr = await tab.$$(".entry.js-blc.js-blc-t-heart.btn-heart.btn.btn-heart-circle.js-heart-button") ;
    console.log(Arr.length) ;
    
   // await Arr[0].click() ;

    for(let idx=0;idx<num;idx++){
        await Arr[idx].click();
        await tab.waitFor(200);

        console.log("picture-> " + idx +" is clicked")
        }

}

async function Follow(tab){
    
    try
    {   let link = await tab.waitForSelector(`a[href='/search/collections?query=${search}&sort=most_recent']`) ;
             
        let link2 = await tab.evaluate(function(a){
            return a.href ;
        },link);

        console.log(link2) ;

        await tab.goto(link2,{
                waitUntil : "networkidle2" 
        }) ;

        await tab.waitForSelector(".btn.btn-small.js-follow-collection-button.bg-gradient") ;
        let arr = await tab.$$(".btn.btn-small.js-follow-collection-button.bg-gradient");

        console.log(arr.length) ;

        for(let idx=0 ; idx<FOLLOW ; idx++)
        {           
            await arr[idx].click() ;
            await tab.waitFor(600) ;
            console.log(idx + "followed") ;
        }
    
    }catch(err)
    {
        console.log(err.message) ;
    }
}

async function Discover(tab){

    try
    {   await tab.waitForSelector(".icon.icon-discover") ;
        await tab.click(".icon.icon-discover") ;

        await tab.waitForSelector("li.hide-sm.hide-xs");
        let list = await tab.$$("li.hide-sm.hide-xs ") ;

        console.log(list.length) ;
         let DropDown = 1 ;

        for(let i=1;i<list.length-1;i++){  //0 par popular images
            let option=await tab.evaluate(function(choice){
            return choice.textContent;
            },list[i]);
            //console.log(option);
            if(option.includes(CHOICE)){
                console.log(option + "is clicked") ;
                DropDown = 0 ; //drop down nahi h ye
                await list[i].click();
                break;
            }

        }
   
        if(DropDown == 1)
        {   //tab.waitFor(300) ;  
           // await tab.waitForSelector("li.hide-sm.hide-xs.dropdown.dropdown-right",{visible:true});
           for(let i=0;i<5;i++){
            await tab.keyboard.press('ArrowDown');
            }
            tab.waitFor(180) ;
            await tab.hover("li.hide-sm.hide-xs.dropdown.dropdown-right",{visible:true});
            tab.waitFor(180);

            let l1 =  `https://weheartit.com/popular_images/${year}` ;
            await tab.goto(l1 , {
                waitUntil:"networkidle2"
            }) ;

            await tab.waitForSelector("li.hide-sm.hide-xs.dropdown.dropdown-right");
            await tab.hover("li.hide-sm.hide-xs.dropdown.dropdown-right");
            tab.waitFor(180);

            let l2 = `https://weheartit.com/popular_images/${year}/${month}` ;
            await tab.goto(l2, {
                waitUntil:"networkidle2"
            }) ;

            tab.waitFor(180);
            await tab.waitForSelector("li.hide-sm.hide-xs.dropdown.dropdown-right");
            await tab.hover("li.hide-sm.hide-xs.dropdown.dropdown-right");
            tab.waitFor(180);

            let l3 = `https://weheartit.com/popular_images/${year}/${month}/${date}` ;
            await tab.goto(l3, {
                waitUntil:"networkidle2"
            }) ;

       }

       await Like(tab) ;    
    }
    catch(err)
    {
        console.log(err.message) ;
    }
    
}

async function changeCoverPhoto(tab){

try{
        await tab.waitForSelector("#text") ;
        await tab.type('#text' , searchProfile , {delay:150} ) ;
        await tab.keyboard.press("Enter") ;

        let link = await tab.waitForSelector(`a[href='/search/entries?query=${searchProfile}&sort=most_popular']`) ;
        
        console.log("link1" + link) ;
        
        let link2 = await tab.evaluate(function(a){
            return a.href ;
        },link);

        console.log("link2 "+link2) ;

        await tab.goto(link2,{
                waitUntil : "networkidle2" 
        }) ;

        await tab.waitForSelector(".js-entry-detail-link.js-blc.js-blc-t-entry");  
                
        let photos = await tab.$$(".js-entry-detail-link.js-blc.js-blc-t-entry");

        console.log(photos.length) ; //24
        //console.log(photo[0]) ;
        
        let pic = photos[0] ;

        let link3 = await tab.evaluate(function(a){
            return a.href ;
        },pic);

        console.log("link3 "+ link3) ;
        
        await tab.goto(link3,{
            waitUntil : "networkidle2" 
        }) ;
  
        await tab.waitFor(200);

        await tab.waitForSelector(".icon.icon-more");
        await tab.click(".icon.icon-more" , {visible:true});

        tab.waitFor(150) ;

        await tab.waitForSelector("form[action='/cover-image']");
        await tab.click("form[action='/cover-image']") ;

        console.log("\n"+"COVER IMAGE SET");

    }catch(err)
    {
        console.log(err.message);
    }

}

async function clear(tab, selector) {
    await tab.evaluate(selector => {
      document.querySelector(selector).value = "";
    }, selector);
}

async function addToCollections(tab){

    try
    {   await tab.waitForSelector("#current_user");
        await tab.hover("#current_user") ;

        let LINK = await tab.waitForSelector("a[href='/laxomo8786/collections']") ;
        let LINK1 = await tab.evaluate(function(a){
            return a.href ;
        },LINK)

        await tab.goto(LINK1,{
            waitUntil:"networkidle2"
        }) ;

        for(let i=0;i<=5;i++){
            await tab.keyboard.press('ArrowDown');
            }
    
        await tab.waitForSelector(".btn.btn-wide.bg-gradient.js-create-set-button") ; //create new collection
        await tab.click(".btn.btn-wide.bg-gradient.js-create-set-button") ;
        
        await tab.waitFor(200);
        
        await tab.waitForSelector(".input-block.js-set-name-field") ; //type in name
        await tab.type(".input-block.js-set-name-field",collectionName,{delay:150}) ;
        
        await tab.waitForSelector("input[name='commit']") ; //save
        await tab.click("input[name='commit']") ;

        let LINK3 = await tab.waitForSelector("a[href='/laxomo8786']") ;
        let LINK4 = await tab.evaluate(function(a)
        {
            return a.href ;
        },LINK3) ;

        await tab.goto(LINK4,{
            waitUntil:"networkidle2"
        });

        await tab.waitForSelector(".icon.icon-collection.icon-white");
        let arr=await tab.$$(".icon.icon-collection.icon-white") ;
        console.log(arr.length);
        for(let idx=0 ; idx<4 ; idx++)
        {   //await tab.waitFor(200000) ;
            await arr[idx].click();
            await tab.waitFor(850) ;
            // await tab.waitForSelector("div.list-item input[type='search']") ;
            // await tab.click("div.list-item input[type='search']") ;

            await tab.waitForSelector(".collection-preview .col.span-12 .text-primary" , {visible:true}) ;
            let a = await tab.$$(".collection-preview .col.span-12 .text-primary") ; //list of collections
            //a[0].click() ;
            for(let i=0;i<a.length;i++){  //0 par popular images
                let option=await tab.evaluate(function(choice){
                return choice.textContent;
                },a[i]);
                //console.log(option);
                if(option.includes(PICK)){
                    console.log(option + " is clicked") ;
                    //DropDown = 0 ; //drop down nahi h ye
                    tab.waitFor(900) ;
                    await a[i].click();
                    break;
                }
            }

            await tab.waitForSelector(".btn.bg-gradient.btn-wide.js-modal-close.js-modal-done") ;
            await tab.click(".btn.bg-gradient.btn-wide.js-modal-close.js-modal-done") ;
        }
    }catch(err)
    {
        console.log(err.message) ;
    }
}

async function uploadFile(tab){ //works for previous versions

    link = await tab.waitForSelector("a[href='https://weheartit.com/settings/picture']");
    link2 = await tab.evaluate(function(a){
        return a.href ;
    },link) ;

    await tab.goto(link2,{
        waitUntil : "networkidle2"
    }) ;

    // const [Chooser] = await Promise.all([
    //     tab.waitForFileChooser() ,
    //     tab.click("input[type='file']") 
    // ])
    // await tab.waitFor(200) ;
    // await Chooser.accept("my_heart\image.jpg") ;

    const input = await tab.waitForSelector("input[type=file]");
    await input.uploadFile("image1.jpg") ;

    await tab.waitForSelector("input[name='commit']");
    await tab.click("input[name='commit']") ;

    console.log("\n"+"PROFILE UPDATED") ;

}

async function screenShot(tab){

    await tab.waitForSelector("#text") ;
    await tab.type('#text' , ss , {delay:150} ) ;
    await tab.keyboard.press("Enter") ;
    
    await tab.waitForSelector(".entry-thumbnail ")
    let ALLArr=await tab.$$(".entry-thumbnail ");
    console.log(ALLArr.length);
   
    let title=await tab.evaluate(function(a){
            return a.src;
        },ALLArr[0]);

    console.log(title);

    await tab.goto(title,{
        waitUntil : "networkidle2"
    }) ;

    await tab.screenshot({ path: './image1.jpg', type: 'jpeg' }) ; //clip: { x: 300, y: 250, width: 300, height: 250 } });
    console.log("\n"+"SCREENSHOT TAKEN") ;
    await tab.waitFor(13000) ;
    let url = `https://weheartit.com/search/entries?utf8=%E2%9C%93&ac=0&query=${ss}`
    tab.goto(url,{
        waitUntil : "networkidle2"
    }) ;

}

async function share(tab)
 {  
    try{
        await tab.waitForSelector(".icon.icon-home") ;
        await tab.click(".icon.icon-home") ;

        await tab.waitForSelector("#text") ;
        await tab.type('#text' , "adorable puppies" , {delay:100} ) ;
        await tab.keyboard.press("Enter") ;

        await tab.waitForSelector(".icon.icon-share.icon-white ") ;
        let s = await tab.$$(".icon.icon-share.icon-white ");
        console.log(s.length) ;

        await s[0].click() ;

        //let a = await tab.waitForSelector(".btn.btn-block.bg-tumblr") ;
        let a = await tab.waitForSelector(".btn.btn-block.bg-facebook");

        let LINK= await tab.evaluate(function(a){
            return a.href ;
        },a) 

        console.log(LINK) ;

        FRNDS = LINK ;  
    }
    catch(err)
    {
        console.log(err.message);
    }

}

async function fb(tab1)
{
    try
    {
        await tab1.waitForSelector("#email");
        await tab1.type("#email",email,{delay:150});

        await tab1.waitForSelector("#pass") ;
        await tab1.type("#pass" , p , {delay:150}) ;

        await tab1.waitForSelector("input[type='submit']");
        await tab1.click("input[type='submit']");

        await tab1.waitFor(200);

        await tab1.waitForSelector("textarea[title='Say something about this...']") ;
        await tab1.click("textarea[title='Say something about this...']") ;
        await tab1.type("textarea[title='Say something about this...']", tumblr_msg,{delay:100});

        await tab1.waitForSelector("button[name='__CONFIRM__']") ;
        await tab1.click("button[name='__CONFIRM__']") ;

        console.log("\n"+"SHARING DONE(POSTED ON FB)") ;

        await tab1.close() ;
    }
    catch(err)
    {
        console.log(err.message) ;
    }
}
