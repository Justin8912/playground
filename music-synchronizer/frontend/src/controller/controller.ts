import {PROPOSED_CHANGES_ID_HEADER, synchronizationApiEndpoint} from "../util/constants";
import { type SynchronizationProposal } from "../model/ControllerTypes";

export const getSynchronizationProposal = async (
    sourceService: string,
    targetService: string,
    sourceUser: string,
    targetUser: string,
    playlistName: string,
    changeRequestId?: string
): Promise<SynchronizationProposal> => {
    let headers = {}
    if (changeRequestId) {
        // @ts-ignore
        headers[PROPOSED_CHANGES_ID_HEADER] = changeRequestId;
    }
    console.log("Sending headers: ", headers);
    const response: Response = await fetch(`${synchronizationApiEndpoint}/updates/sourceUser/${sourceUser}/targetUser/${targetUser}/sourceService/${sourceService}/targetService/${targetService}/playlist/${playlistName}`, {
        method: "GET",
        headers: headers
    })

    const proposedChangesId = response.headers.get(PROPOSED_CHANGES_ID_HEADER) as string;
    let data = await response.json();

    if (response.status !== 200) {
        throw new Error("Failed to fetch proposed changes from server: " + data);
    }

    return {
        data,
        proposedChangesId
    }
}

export const updateSynchronizationProposal = async (
    sourceService: string,
    targetService: string,
    sourceUser: string,
    targetUser: string,
    playlistName: string,
    proposedChangesId: string,
    operation: string,
    sourceSongId: string,
    targetSongId: string
): Promise<void> => {
    const response: Response = await fetch(
        `${synchronizationApiEndpoint}/updates/sourceUser/${sourceUser}/targetUser/${targetUser}/sourceService/${sourceService}/targetService/${targetService}/playlist/${playlistName}`,
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

    console.log(response);
}

export const synchronizePlaylist = async (
    sourceService: string,
    targetService: string,
    sourceUser: string,
    targetUser: string,
    playlistName: string,
    proposedChangesId: string
): Promise<void> => {
    const response: Response = await fetch(
        `${synchronizationApiEndpoint}/synchronize/sourceUser/${sourceUser}/targetUser/${targetUser}/sourceService/${sourceService}/targetService/${targetService}/playlist/${playlistName}`,
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

    console.log(response);
}