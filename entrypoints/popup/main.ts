import "@/style.css";
import { setupCounter } from "@/components/counter";

const appElement = document.querySelector<HTMLDivElement>("#app");
if (appElement) {
	appElement.innerHTML = `

`;
}

const counterButton = document.querySelector<HTMLButtonElement>("#counter");
if (counterButton) {
	setupCounter(counterButton);
}
