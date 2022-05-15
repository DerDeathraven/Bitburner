/** @param {NS} ns **/

export function createAllServerArr(ns,usedArr = [ns.getHostname()]){
	
	
	
		
	ns.scan().forEach(f=>{
		
		usedArr = scanAndReturn(ns,f,usedArr)
		
	})
	
	
	usedArr.forEach(f=>{
		usedArr = scanAndReturn(ns,f,usedArr)
	})
	
	return usedArr
	
}
export function scanAndReturn(ns,where,used){
	var scanArr = ns.scan(where)
	scanArr.forEach(f=>{
		if(used.indexOf(f)==-1){
			used.push(f)
		}
	})
	return used

}
//thanks Stackoverflow
export async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}
//end thanks Stackoverflow
export function getAllServers(ns){
	 var oldlength = 0
   	 var newArr = []
   do{
   oldlength = newArr.length
   newArr = createAllServerArr(ns,newArr)
   
   
   }while(newArr.length != oldlength)

   return newArr
}