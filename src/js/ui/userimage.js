import { getUser } from "../api/firebase-service";

export function showUserImage() {
    document.getElementById('userimage').classList.remove("is-hidden");
    document.getElementById('userimage').classList.add("visible");
    document.getElementById('userimage').src = getUser().photoURL;
  }
  