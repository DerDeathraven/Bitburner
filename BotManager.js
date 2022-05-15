/** 
 * @author DerDeathraven 
 * @param {NS} ns 
 * This is the main command center
 * This script handles communication with the node-RED server and calculates the best targets
 * {@link https://github.com/DerDeathraven}
 * 
 * **/
import * as LB from "./LuckysLib.js"
var threads = 0
var t
export async function main(ns) {
	//ns.disableLog("ALL")
	
	var serverObj = await getParams(ns)
	var lastGrow =0
	var targetServers = {}
	
	while(true){
		threads = 0
	LB.getAllServers(ns).forEach(target=>{
		serverObj[target] = ns.getServer(target)
		serverObj[target]["threads"] = Math.floor(serverObj[target]["maxRam"] / ns.getScriptRam("Hack.js"))
	})
	
		
		
		
		await ns.wget("http://localhost:1880/idle","idleservers.txt")
		var idleServers = JSON.parse(await ns.read("idleservers.txt"))
		
		 t = JSON.parse(ns.read("targetMission.txt"))
		
		
		Object.keys(idleServers).forEach(f=>{
			serverObj[f]["idle"]=idleServers[f] //idleServer has to look like {server:true}
			
		})
		
		
		
		
		
		
		
		
		
	var serverWithMaxMoney = getServerWithMaxMoney(ns,serverObj)
	
	
	if(threads > 0){
		
		await handleHackTarget(ns,serverObj,serverWithMaxMoney)
		
	}
		
		await ns.sleep(1000)
	}

}

/**
 * 
 * @param {Object} ns Game Namespace
 * @param {Object} serverObj List of all servers with root access
 * @param {Array<String>} ignore list of Servers to be ignored
 * @returns 
 */
function getServerWithMaxMoney(ns,serverObj,ignore=[]){
	let serverWithMaxMoney = ""
	let lastMoney = 0
	Object.keys(serverObj).forEach(f=>{
			
			if(f!="home"){
				
				threads += serverObj[f]["idle"]? serverObj[f]["threads"]: 0//wenn idle dann bitte threadsrise
				 }
			var ignoreBoolean = ignore.indexOf(f) == -1
			if(!serverObj[f]["purchasedByPlayer"]&&ns.getServerRequiredHackingLevel(f)<=ns.getHackingLevel()&& ignoreBoolean){
				if(t[f]==undefined){
					if(serverObj[f]["moneyMax"]>lastMoney){
						lastMoney = serverObj[f]["moneyMax"]
						serverWithMaxMoney = f
						
					}
				}else if(t[f].missions.length<3){
					if(serverObj[f]["moneyMax"]>lastMoney){
						lastMoney = serverObj[f]["moneyMax"]
						serverWithMaxMoney = f
						
					}
				}
			}
		})
		return serverWithMaxMoney
}

/**
 * 
 * @param {Object} ns 
 * @returns {Object} list of all servers with root access
 */
async function  getParams(ns){
	
	var serverArr = LB.getAllServers(ns)
	var rootArr = []
	var serverObj = {}
	var threads = 0
	serverArr.forEach(f=>{
		if(ns.hasRootAccess(f)){
			rootArr.push(f);  //Collect all servers that i have root access on
		}
	})
	
	await LB.asyncForEach(rootArr,async target=>{
		
        serverObj[target] = ns.getServer(target)
        serverObj[target]["threads"] = Math.floor(serverObj[target]["maxRam"] / ns.getScriptRam("Hack.js")) //How much threads this server can handle
        threads +=  Math.floor(serverObj[target]["maxRam"] / ns.getScriptRam("Hack.js")) //Global threads amount
        await ns.wget("http://localhost:1880/setIdle?id="+target,"idleservers.txt") //Register this server with node-RED
        await ns.wget("http://localhost:1880/threads?id="+threads,"egal.txt") //Rise node-RED thread count
        
	})
	await ns.write("targetMission.txt",JSON.stringify({"home":"none"}),"w") //has somekind of use i think....
	return serverObj
}

/**
 * 
 * @param {Object} server single server object
 * @param {String} name Server Name
 * @param {Object} ns Namespace
 * @returns {Integer} Threads needed to grow target 
 */
function getgrowNeeded(server,name,ns){
	server["moneyAvailable"] = ns.getServerMoneyAvailable(name)
	let maxMoney = server["moneyMax"]
	let isMoney = server["moneyAvailable"]==0?1:server["moneyAvailable"]
	
	if(maxMoney>0){
		let growThreads = ns.growthAnalyze(name,maxMoney/isMoney)
		if(maxMoney!=isMoney && growThreads>1){
			return growThreads
		}else{
			return 0
		}
	}else{
		return 0
	}
}
/**
 * 
 * @param {Integer} threads Total amount of threads
 * @param {Object} serverObj All servers that i have access to
 * @param {Object} ns Namespace
 * @returns {Object} All servers that should be given the Job
 */

function getBestServer(threads,serverObj,ns){
	
	let threadsNeeded =  threads
	let serverObjArr =  Object.keys(serverObj).map(f=> {return serverObj[f];})
	let outputObj = {}
	ns.print("Threads needed for task: "+threadsNeeded)
	serverObjArr.sort(function(a, b){
    return b.threads - a.threads;
	});
	serverObjArr.every(e=>{
		
			if(threadsNeeded>0){
				
				if(e.idle&&e.threads!=0){
					threadsNeeded-=e.threads
					outputObj[e.hostname]=e
						
				}
				return true
			}else{
				return false;
			}
	})
	


	
	return outputObj
}

/**
 * 
 * @param {Object} ns Namespace
 * @param {Object} serverObj All servers that i have access to
 * @param {String} serverWithMaxMoney Target
 * @param {String} mission Which job to execute
 */
async function callServer(ns,serverObj,serverWithMaxMoney,mission){
	var threads = 0
	switch(mission){
		case "grow":
			threads = getgrowNeeded(serverObj[serverWithMaxMoney],serverWithMaxMoney,ns)
			ns.tprint("["+serverWithMaxMoney+"]"+"Threads to grow : "+threads)
		break;
		case "hack":

			threads = Math.round(ns.hackAnalyzeThreads(serverWithMaxMoney,serverObj[serverWithMaxMoney]["moneyAvailable"]))
			ns.tprint("["+serverWithMaxMoney+"]"+"Threads to hack : "+threads)
		break;
		case "weaken":
		var securitylevel = ns.getServerSecurityLevel(serverWithMaxMoney)
		

		threads = 2000
		ns.tprint("["+serverWithMaxMoney+"]"+"Threads to Weaken : "+threads)
			
		break;
	}


	var servers = getBestServer(threads,serverObj,ns)
			
	await LB.asyncForEach(Object.keys(servers),async f=>{
				
        var task = JSON.stringify({"mission":mission,"target":serverWithMaxMoney})
        await ns.wget("http://localhost:1880/task?id="+f+"&task="+task,"egal.txt")
        await ns.exec("Hack.js",f,servers[f]["threads"],f)
        ns.print("New Target: "+serverWithMaxMoney)
				
	})
	
}

/**
 * 
 * @param {Object} ns Namespace
 * @param {Object} serverObj All servers that i have access to
 * @param {String} serverWithMaxMoney Target
 * @param {Array<String>} ignore List of servers to ignore
 */
async function handleHackTarget(ns,serverObj,serverWithMaxMoney,ignore = []){
	
	await ns.wget("http://localhost:1880/targetMissions","targetMission.txt")
	var rawData = ns.read("targetMission.txt")
	var t = JSON.parse(rawData)
	var mission = ""
	var moneybool =  0<getgrowNeeded(serverObj[serverWithMaxMoney],serverWithMaxMoney,ns)
	var hackbool = -1<ns.hackAnalyzeThreads(serverWithMaxMoney,serverObj[serverWithMaxMoney]["moneyAvailable"])
	
	if(Object.keys(t).indexOf(serverWithMaxMoney)!=-1){
		var beinghacked = t[serverWithMaxMoney].missions.indexOf("hack")!=-1
		var beinggrown = t[serverWithMaxMoney].missions.indexOf("grow")!=-1
		var beingweakend = t[serverWithMaxMoney].missions.indexOf("weaken")!=-1
		
		if(beinggrown && !moneybool){
				if(ns.getServerSecurityLevel(serverWithMaxMoney)>30&&!beingweakend){
					mission = "weaken"
				}else{
					mission = "hack"
				}
		}else if(beinghacked && moneybool){
					mission = "grow"
					
		}else{
					mission = "none"
		}
		
	}else{
		if(!moneybool&&hackbool){
			if(ns.hackAnalyzeThreads(serverWithMaxMoney,serverObj[serverWithMaxMoney]["moneyAvailable"])!=0){
					mission = "hack"
			}else{
					mission = "weaken"
			}
					
		}else{
					mission = "grow"
					
		}
		
	}
	if(mission=="none"){
		ignore.push(serverWithMaxMoney)
		serverWithMaxMoney = getServerWithMaxMoney(ns,serverObj,ignore)
		await handleHackTarget(ns,serverObj,serverWithMaxMoney,ignore)
	}
	await callServer(ns,serverObj,serverWithMaxMoney,mission)
}