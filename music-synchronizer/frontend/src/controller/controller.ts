import {PROPOSED_CHANGES_ID_HEADER, synchronizationApiEndpoint} from "../util/constants";
import {
    ProposedChanges,
    ProposedChangesRequestDetails,
    Song,
    type SynchronizationProposal
} from "../model/ControllerTypes";
import {res} from "./dummy";

const environment = "development";
export const getSynchronizationProposal = async (
    requestDetails: ProposedChangesRequestDetails,
    changeRequestId?: string
): Promise<SynchronizationProposal> => {
    if (environment === "development") {
        return res
    }

    let headers = {}
    if (changeRequestId) {
        // @ts-ignore
        headers[PROPOSED_CHANGES_ID_HEADER] = changeRequestId;
    }
    const response: Response = await fetch(`${synchronizationApiEndpoint}/updates/sourceUser/${requestDetails.sourceUser}/targetUser/${requestDetails.targetUser}/sourceService/${requestDetails.sourceService}/targetService/${requestDetails.targetService}/playlist/${requestDetails.playlist}`, {
        method: "GET",
        headers: headers
    })

    const proposedChangesId = response.headers.get(PROPOSED_CHANGES_ID_HEADER) as string;
    let data = await response.json();

    if (response.status !== 200) {
        throw new Error("Failed to fetch proposed changes from server: " + data.message);
    }

    return {
        data,
        proposedChangesId
    }
}

export const updateSynchronizationProposal = async (
    requestDetails: ProposedChangesRequestDetails,
    proposedChangesId: string,
    operation: string,
    sourceSongId: string,
    targetSongId: string
): Promise<ProposedChanges<ProposedChangesRequestDetails>> => {
    if (environment === "development") {
        return res.data
    }
    const response: Response = await fetch(
        `${synchronizationApiEndpoint}/updates/sourceUser/${requestDetails.sourceUser}/targetUser/${requestDetails.targetUser}/sourceService/${requestDetails.sourceService}/targetService/${requestDetails.targetService}/playlist/${requestDetails.playlist}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                proposedChangesId,
                operation,
                sourceSongId,
                targetSongId
            })
        }
    );

    let data = await response.json();
    if (response.status !== 200) {
        throw new Error("Failed to updated the proposed changes on the server: " + data.message);
    }

    return data;
}

export const synchronizePlaylist = async (
    requestDetails: ProposedChangesRequestDetails,
    proposedChangesId: string
): Promise<Song[]> => {
    if (environment === "development") {
        return res.data.uncertainProposedChanges.map(mapping => mapping.targetSong)
    }

    const response: Response = await fetch(
        `${synchronizationApiEndpoint}/synchronize/sourceUser/${requestDetails.sourceUser}/targetUser/${requestDetails.targetUser}/sourceService/${requestDetails.sourceService}/targetService/${requestDetails.targetService}/playlist/${requestDetails.playlist}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                proposedChangesId: proposedChangesId
            })
        }
    );

    let data = await response.json();

    if (response.status !== 200) {
        throw new Error("Failed to synchronize the playlist on the server: " + data.message);
    }

    return data;
}