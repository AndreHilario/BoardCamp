import { Router } from "express";
import { editCustomers, getCustomers, getCustomersById, postCustomers } from "../controllers/customers.controller.js";


const customersRouter = Router();

customersRouter.get("/customers", getCustomers);
customersRouter.get("customers/:id", getCustomersById);
customersRouter.post("customers", postCustomers);
customersRouter.put("customers/:id", editCustomers);


export default customersRouter;