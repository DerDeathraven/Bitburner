/** @param {NS} ns
 *  **/
 import * as LB from "./LuckysLib.js"
 export async function main(ns) {
  var arr =  LB.getAllServers(ns)
 
  arr.splice(arr.indexOf("home"),1)
  arr.splice(arr.indexOf("darkweb"),1)
  
 
 
  var hackinglvlArr = []
  await LB.asyncForEach(arr,async (f,i)=>{
     await ns.scp("Hack.js",f)
     
 if(ns.getServerRequiredHackingLevel(f)<=ns.getHackingLevel()){
     
      if(ns.hasRootAccess(f)){
          if(ns.isRunning("Hack.js",f))ns.scriptKill("Hack.js",f)
             
                 
                 
                 await ns.scp("Hack.js",f)
                 
          }else{
          
          ns.tprint("Trying to BruteForce: "+f)
          try{
          
          if(ns.fileExists("brutessh.exe","home"))await ns.brutessh(f)
          if(ns.fileExists("ftpcrack.exe","home"))await ns.ftpcrack(f)
          if(ns.fileExists("httpworm.exe","home"))await ns.httpworm(f)
          if(ns.fileExists("relaysmtp.exe","home"))await ns.relaysmtp(f)
          
          
          ns.nuke(f)
           
          }catch{
             ns.tprint("Failed to Hack: "+f)
          }
      }
  
     
  }else{
      hackinglvlArr.push(ns.getServerRequiredHackingLevel(f))
  }
  })
  ns.tprint("Next Hacking lvl has to be: "+ hackinglvlArr[0])
 }