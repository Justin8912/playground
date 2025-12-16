export type Song = {
    title: string;
    artists: string[];
    videoId: string;
    description?: string
}

export type ProposedChanges<TRequestDetails = {}> = {
    confidentProposedChanges: { sourceSong: Song; targetSong: Song }[];
    uncertainProposedChanges: { sourceSong: Song; targetSong: Song }[];
    requestDetails: TRequestDetails;
}

export type ProposedChangesRequestDetails = {
    sourceUser: string,
    targetUser: string,
    sourceService: string,
    targetService: string,
    playlist: string
}

export type SynchronizationProposal = {
    data: ProposedChanges<ProposedChangesRequestDetails>,
    proposedChangesId: string
}