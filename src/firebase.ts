import { initializeApp } from 'firebase/app';

import { getDoc, doc, getFirestore, setDoc, Firestore } from 'firebase/firestore'


export class FirebaseHandler {
  store: Firestore;
  constructor(options: object) {
    const firebaseConfig = options

    const app = initializeApp(firebaseConfig);
    this.store = getFirestore(app);
  }

  public async push(data: any, path: string) {
    // WRITING
    const document = doc(this.store, path)
    await setDoc(document, data)

  }

  public async pull(path: string) {

    // READING
    const document = doc(this.store, path)
    const snapshot = await getDoc(document)
    const data = snapshot.data()

    return data

  }

}

