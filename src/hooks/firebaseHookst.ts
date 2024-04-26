import { QueryConstraint, collection, doc, onSnapshot, query } from "firebase/firestore";
import { useEffect, useState } from "react"
import { useFirestore } from "reactfire";
import { fromFirebaseDoc, fromFirebaseDocs } from "../utils/shared/firebase";

export const useFirebaseDoc = <T>(path: string): [T | null, Function] => {
    const [document, setDocument] = useState<T | null>(null)
    const firestore = useFirestore();

    useEffect(() => {
        return onSnapshot(doc(firestore, path), snap => {
            const result = fromFirebaseDoc<T>(snap);
            setDocument(result)
        })
    }, [path, firestore])

    return [document, setDocument]
}

export const useFirebaseQuery = <T>(path: string, ...queryConstraints: QueryConstraint[]): [T[], Function] => {
    const [documents, setDocuments] = useState<T[]>([])
    const firestore = useFirestore();

    useEffect(() => {
        const q = query(collection(firestore, path), ...queryConstraints)
        return onSnapshot(q, snap => {
            const result = fromFirebaseDocs<T>(snap.docs);
            setDocuments(result)
        });
    }, [path, firestore, queryConstraints]);

    return [documents, setDocuments]
}
