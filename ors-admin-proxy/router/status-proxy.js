const express = require('express');
const router = express.Router();
const { createProxyMiddleware } = require("http-proxy-middleware");

router.use(
	"/omsproxy/E1",
	createProxyMiddleware({
		target: process.env.E1,
		pathRewrite: {
			"^/omsproxy/E1/": "/",
		},
	})
);

router.use(
	"/omsproxy/E2",
	createProxyMiddleware({
		target: process.env.E2,
		pathRewrite: {
			"^/omsproxy/E2/": "/",
		},
	})
);

// router.use(
// 	"/omsproxy/E3",
// 	createProxyMiddleware({
// 		target: process.env.E3,
// 		pathRewrite: {
// 			"^/omsproxy/E3/": "/",
// 		},
// 	})
// );
//
// router.use(
// 	"/omsproxy/E4",
// 	createProxyMiddleware({
// 		target: process.env.E4,
// 		pathRewrite: {
// 			"^/omsproxy/E4/": "/",
// 		},
// 	})
// );

router.use(
	"/omsproxy/I1",
	createProxyMiddleware({
		target: process.env.I1,
		pathRewrite: {
			"^/omsproxy/I1/": "/",
		},
	})
);

router.use(
	"/omsproxy/I2",
	createProxyMiddleware({
		target: process.env.I2,
		pathRewrite: {
			"^/omsproxy/I2/": "/",
		},
	})
);

router.use(
	"/omsproxy/BOSync",
	createProxyMiddleware({
		target: process.env.BOSync,
		pathRewrite: {
			"^/omsproxy/BOSync/": "/",
		},
	})
);

router.use(
	"/omsproxy/ORSSync",
	createProxyMiddleware({
		target: process.env.ORSSync,
		pathRewrite: {
			"^/omsproxy/ORSSync/": "/",
		},
	})
);

// router.use(
// 	"/omsproxy/MOMS",
// 	createProxyMiddleware({
// 		target: process.env.MOMS,
// 		pathRewrite: {
// 			"^/omsproxy/MOMS/": "/",
// 		},
// 	})
// );

router.use(
	"/omsproxy/ORDERCACHE",
	createProxyMiddleware({
		target: process.env.ORDERCACHE,
		pathRewrite: {
			"^/omsproxy/ORDERCACHE/": "/",
		},
	})
);

// router.use(
// 	"/omsproxy/ENGINE",
// 	createProxyMiddleware({
// 		target: process.env.ENGINE,
// 		pathRewrite: {
// 			"^/omsproxy/ENGINE/": "/",
// 		},
// 	})
// );

router.use(
	"/omsproxy/OMSService1",
	createProxyMiddleware({
		target: process.env.OMSService1,
		pathRewrite: {
			"^/omsproxy/OMSService1/": "/",
		},
	})
);

router.use(
	"/omsproxy/OMSService2",
	createProxyMiddleware({
		target: process.env.OMSService2,
		pathRewrite: {
			"^/omsproxy/OMSService2/": "/",
		},
	})
);

// router.use(
// 	"/omsproxy/OMSService3",
// 	createProxyMiddleware({
// 		target: process.env.OMSService3,
// 		pathRewrite: {
// 			"^/omsproxy/OMSService3/": "/",
// 		},
// 	})
// );
//
// router.use(
// 	"/omsproxy/OMSService4",
// 	createProxyMiddleware({
// 		target: process.env.OMSService4,
// 		pathRewrite: {
// 			"^/omsproxy/OMSService4/": "/",
// 		},
// 	})
// );
exports.statusProxy = router;