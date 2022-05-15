/** @param {NS} ns **/
export async function main(ns) {
	var lastprice = 0;
	do{
		var money =  ns.getServerMoneyAvailable("home");
		
		 await buyServer(ns);
		 
		var f= await buystocks(ns);
		 
		if(lastprice<f){
		ns.toast("[BuyStocks]Cost for Next Upgrade: "+Math.floor(f),"info",2000)
		lastprice=f
		}
		
		

		
		await ns.sleep(100)
	}while(true)
	
	
	
		
	
	

}
async function buystocks(ns){

		var serverMenge = ns.hacknet.numNodes()
		var stopit = 0;
		var highestCost = 0;
		
		do{
		var money =  ns.getServerMoneyAvailable("home");
		for(var i = 0;i<serverMenge;i++){
			await ns.hacknet.upgradeCore(i,1)
			var upgradeCost = ns.hacknet.getLevelUpgradeCost(i);
			var ramCost = ns.hacknet.getRamUpgradeCost(i);
			var coreCost = ns.hacknet.getCoreUpgradeCost(i)
			if(money>upgradeCost||money>ramCost){
				if(money>upgradeCost){
				await ns.hacknet.upgradeLevel(i,1)
				}else if(money>ramCost){
				await ns.hacknet.upgradeRam(i,1)
				}else{
				await ns.hacknet.upgradeCore(i,1)
				}
				
			}else{
				
				
				if(highestCost<upgradeCost){
					highestCost = upgradeCost
				}
				stopit++
			}
			
		}
		
		}while(stopit<serverMenge)
		
		return highestCost
}
async function buyServer(ns){
	do{
		var money =  ns.getServerMoneyAvailable("home");
		var serverCost =  ns.hacknet.getPurchaseNodeCost();
		
			var  f = ns.hacknet.purchaseNode()
			f!=-1?ns.tprint("Bought server" + f):ns.print("lol sollte nich passieren")
	}while(money>serverCost)
		 
}