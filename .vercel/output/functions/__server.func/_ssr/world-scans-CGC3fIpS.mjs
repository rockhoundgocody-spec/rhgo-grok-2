import { i as string, r as object } from "../_libs/zod.mjs";
import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/world-scans-CGC3fIpS.js
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var listWorldScans = createServerFn({ method: "GET" }).handler(createSsrRpc("d083a34e4e03c2a374e48007517c255aa87b6cf2cdf13728b846bf4c738b4110"));
var recordWorldScan = createServerFn({ method: "POST" }).validator(object({ mineralId: string().min(1).max(80) })).handler(createSsrRpc("633467194324f7c94bbc947e3f6dccc82a15291f62c3843b221475582cd1259e"));
//#endregion
export { recordWorldScan as n, listWorldScans as t };
