import { QueryConstraint, collection, doc, onSnapshot, query } from "firebase/firestore";
import { useEffect, useState } from "react"
import { useFirestore } from "reactfire";
import { fromFirebaseDoc, fromFirebaseDocs } from "../utils/shared/firebase";

export const useFirebaseDoc = <T>(path: string): [T | null, Function, boolean] => {
    const [state, setState] = useState<{ document: T | null, loaded: boolean }>({ document: null, loaded: false })
    const firestore = useFirestore();

    useEffect(() => {
        const pathParts = path.split('/');
        if (pathParts.length % 2 !== 0 || !pathParts[pathParts.length - 1]) {
            return;
        }

        return onSnapshot(doc(firestore, path), snap => {
            const result = fromFirebaseDoc<T>(snap);
            setState({ document: result, loaded: true })
        })
    }, [path, firestore])

    return [
        state.document,
        (newDocument: T) => setState({ document: newDocument, loaded: true }),
        state.loaded
    ]
}

export const useFirebaseQuery = <T>(path: string, ...queryConstraints: QueryConstraint[]): [T[], Function, boolean] => {
    const [state, setState] = useState<{ documents: T[], loaded: boolean }>({ documents: [], loaded: false })
    const firestore = useFirestore();

    useEffect(() => {
        const q = query(collection(firestore, path), ...queryConstraints)
        return onSnapshot(q, snap => {
            const result = fromFirebaseDocs<T>(snap.docs);
            setState({ documents: result, loaded: true })
        });
        // eslint-disable-next-line
    }, [path, firestore]);

    return [
        state.documents,
        (newDocuments: T[]) => setState({ documents: newDocuments, loaded: true }),
        state.loaded]
}
