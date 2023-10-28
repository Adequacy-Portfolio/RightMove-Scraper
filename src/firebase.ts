import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, Firestore, addDoc} from 'firebase/firestore/lite';

// TODO: Replace the following with your app's Firebase project configuration
const firebaseConfig = {
  //...
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


//reading
// Get a list of cities from your database
// async function getCities(db:Firestore ) {
//   const citiesCol = collection(db, 'z');
//   const citySnapshot = await getDocs(citiesCol);
//   const cityList = citySnapshot.docs.map(doc => doc.data());
//   return cityList;
// }



//writing

async function saveProperties(db:Firestore, data: any) {
    const colRef = collection(db, 'properties')
    await addDoc(colRef, data)
}
