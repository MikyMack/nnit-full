const express = require("express");
const router = express.Router();
const jobController = require("../controllers/jobController");

router.post("/createJob", jobController.createJob);

router.get("/allJobs", jobController.getJobs);

router.get("/singleJob/:id", jobController.getJobById);

router.put("/updatejob/:id", jobController.updateJob);

router.delete("/deleteJob/:id", jobController.deleteJob);

router.patch("/Status/:id/toggle", jobController.toggleJobStatus);

module.exports = router;
