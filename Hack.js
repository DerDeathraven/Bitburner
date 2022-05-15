/** 
 * @author DerDeathraven
 * {@link https://github.com/DerDeathraven}
 * @param {NS} ns
 * 
 * gets his mission from the node-red
 * 
 *  **/
export async function main(ns) {
	var serverName = ns.args[0]
	await ns.wget("http://localhost:1880/bot?id="+serverName+"&finish=false","task.txt")
	var task = JSON.parse(ns.read("task.txt"))
	switch(task["mission"]){
		case "hack":
			await ns.hack(task["target"])
		break;
		case "weaken":
			await ns.weaken(task["target"])
		break;
		case "grow":
			await ns.grow(task["target"])
		break;
	}
	ns.wget("http://localhost:1880/bot?id="+serverName+"&finish=true","egal.txt")
}