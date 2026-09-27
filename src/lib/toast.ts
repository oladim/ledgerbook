"use client";

let timer: ReturnType<typeof setTimeout> | undefined;

const CHECK =
  '<svg class="ic"><use href="#i-check"/></svg>';

export function toast(msg: string) {
  if (typeof document === "undefined") return;
  let el = document.getElementById("toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "toast";
    el.className = "toast";
    document.body.appendChild(el);
  }
  el.innerHTML = CHECK + "<span>" + msg + "</span>";
  el.classList.add("show");
  clearTimeout(timer);
  timer = setTimeout(() => el && el.classList.remove("show"), 2200);
}
