// routes/candidateRoutes.js
const express = require("express");
const router = express.Router();
const candidateController = require("../controllers/candidateController");

// ✅ Get candidates by admin ID (મુખ્ય endpoint)
router.get("/admin/:adminId", candidateController.getCandidatesByAdmin);

// ✅ Get candidates for admin (simple method)
router.get("/simple/:adminId", candidateController.getCandidatesForAdminSimple);

// ✅ Get candidates by admin email
router.get("/email/:email", candidateController.getCandidatesByAdminEmail);

// ✅ Get single candidate details
router.get("/:id", candidateController.getCandidateById);

// ✅ Update candidate status
router.put("/:id", candidateController.updateCandidateStatus);

// ✅ Delete candidate
router.delete("/:id", candidateController.deleteCandidate);

// ✅ Get all candidates (with optional admin filter)
router.get("/", candidateController.getAllCandidates);

// ✅ Search candidates
router.get("/search/all", candidateController.searchCandidates);

// ✅ Get candidate statistics for admin
router.get("/stats/:adminId", candidateController.getCandidateStats);

// ✅ Bulk update status
router.put("/bulk/update", candidateController.bulkUpdateStatus);

// ✅ Debug: Get candidates with job details
router.get("/debug/all", candidateController.getCandidatesWithJobDetails);

module.exports = router;