import {createContext} from "@lit/context";
import {ProposedChangesRequestDetails} from "../model/ControllerTypes";
export const requestDetails = createContext<ProposedChangesRequestDetails>('requestDetails');
export const proposedChangesId = createContext<string>('proposedChangesId');