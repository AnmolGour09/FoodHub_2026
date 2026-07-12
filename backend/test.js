import fs from "fs";
import dotenv from "dotenv";

console.log("Current directory:", process.cwd());

console.log("\n.env file contents:\n");
console.log(fs.readFileSync(".env", "utf8"));

dotenv.config();

console.log("\nParsed env:");
console.log(process.env.RAZORPAY_KEY_ID);
console.log(process.env.RAZORPAY_KEY_SECRET);