import { type DocumentNode } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import {type FC} from 'react';
import {BoardView} from './BoardView';

export interface LoadBoardViewProps {
    query: DocumentNode,
    variables?: {[key: string]: any};
}

export const LoadBoardView: FC<LoadBoardViewProps> = ({query, variables, children}) => {
    const {loading, error, data} = useQuery(query, {variables});
    
    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error :{error.message}</p>;

    console.log(data);

    return (
        <>
            {<BoardView cards={data.getGame.cards} />}
        </>
    )
}