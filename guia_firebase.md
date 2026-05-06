[Video](https://www.youtube.com/watch?v=rbuSx1yEgV8)

You can use Firebase Authentication to allow users to sign in to your app using one or
more sign-in methods, including email address and password sign-in, and
federated identity providers such as Google Sign-in and Facebook Login. This
tutorial gets you started with Firebase Authentication by showing you how to add
email address and password sign-in to your app.

## Add and initialize the Authentication SDK

1. If you haven't already, [install the Firebase JS SDK and initialize Firebase](https://firebase.google.com/docs/web/setup#add-sdk-and-initialize).

2. Add the Firebase Authentication JS SDK and initialize Firebase Authentication:

### Web


> [!NOTE]
> [Learn more](https://firebase.google.com/docs/web/learn-more#modular-version) about the tree-shakeable modular web API and [upgrade](https://firebase.google.com/docs/web/modular-upgrade) from the namespaced API.

<br />

```
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// TODO: Replace the following with your app's Firebase project configuration
// See: https://firebase.google.com/docs/web/learn-more#config-object
const firebaseConfig = {
  // ...
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);
```

### Web


> [!NOTE]
> [Learn more](https://firebase.google.com/docs/web/learn-more#modular-version) about the tree-shakeable modular web API and [upgrade](https://firebase.google.com/docs/web/modular-upgrade) from the namespaced API.

<br />

```
import firebase from "firebase/compat/app";
import "firebase/compat/auth";

// TODO: Replace the following with your app's Firebase project configuration
// See: https://firebase.google.com/docs/web/learn-more#config-object
const firebaseConfig = {
  // ...
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);


// Initialize Firebase Authentication and get a reference to the service
const auth = firebase.auth();
```

## (Optional) Prototype and test with Firebase Local Emulator Suite

Before talking about how your app authenticates users, let's introduce a set of
tools you can use to prototype and test Authentication functionality:
Firebase Local Emulator Suite. If you're deciding among authentication techniques
and providers, trying out different data models with public and private data
using Authentication and Firebase Security Rules, or prototyping sign-in UI designs, being able to
work locally without deploying live services can be a great idea.

An Authentication emulator is part of the Local Emulator Suite, which
enables your app to interact with emulated database content and config, as
well as optionally your emulated project resources (functions, other databases,
and security rules).

Using the Authentication emulator involves just a few steps:

1. Adding a line of code to your app's test config to connect to the emulator.
2. From the root of your local project directory, running `firebase emulators:start`.
3. Using the Local Emulator Suite UI for interactive prototyping, or the Authentication emulator REST API for non-interactive testing.

A detailed guide is available at [Connect your app to the Authentication emulator](https://firebase.google.com/docs/emulator-suite/connect_auth).
For more information, see the [Local Emulator Suite introduction](https://firebase.google.com/docs/emulator-suite).

Now let's continue with how to authenticate users.

## Sign up new users

Create a form that allows new users to register with your app using their email
address and a password. When a user completes the form, validate the email
address and password provided by the user, then pass them to the
`createUserWithEmailAndPassword` method:

### Web

```javascript
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

const auth = getAuth();
createUserWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    // Signed up 
    const user = userCredential.user;
    // ...
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    // ..
  });
```

### Web

```javascript
firebase.auth().createUserWithEmailAndPassword(email, password)
  .then((userCredential) => {
    // Signed in 
    var user = userCredential.user;
    // ...
  })
  .catch((error) => {
    var errorCode = error.code;
    var errorMessage = error.message;
    // ..
  });
```

## Sign in existing users

Create a form that allows existing users to sign in using their email address
and password. When a user completes the form, call the
`signInWithEmailAndPassword` method:

### Web

```javascript
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const auth = getAuth();
signInWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    // Signed in 
    const user = userCredential.user;
    // ...
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
  });
```

### Web

```javascript
firebase.auth().signInWithEmailAndPassword(email, password)
  .then((userCredential) => {
    // Signed in
    var user = userCredential.user;
    // ...
  })
  .catch((error) => {
    var errorCode = error.code;
    var errorMessage = error.message;
  });
```

## Set an authentication state observer and get user data

For each of your app's pages that need information about the signed-in user,
attach an observer to the global authentication object. This observer gets
called whenever the user's sign-in state changes.

Attach the observer using the `onAuthStateChanged` method. When a user
successfully signs in, you can get information about the user in the observer.

### Web

```javascript
import { getAuth, onAuthStateChanged } from "firebase/auth";

const auth = getAuth();
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in, see docs for a list of available properties
    // https://firebase.google.com/docs/reference/js/auth.user
    const uid = user.uid;
    // ...
  } else {
    // User is signed out
    // ...
  }
});
```

### Web

```javascript
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    // User is signed in, see docs for a list of available properties
    // https://firebase.google.com/docs/reference/js/v8/firebase.User
    var uid = user.uid;
    // ...
  } else {
    // User is signed out
    // ...
  }
});
```

## Next steps

Learn how to add support for other identity providers and anonymous guest
accounts:

- [Google Sign-in](https://firebase.google.com/docs/auth/web/google-signin)
- [Facebook Login](https://firebase.google.com/docs/auth/web/facebook-login)
- [Twitter Login](https://firebase.google.com/docs/auth/web/twitter-login)
- [GitHub Login](https://firebase.google.com/docs/auth/web/github-auth)
- [Anonymous sign-in](https://firebase.google.com/docs/auth/web/anonymous-auth)