export function cartDraftId() {
  let id = localStorage.getItem("zm.cart.draft");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("zm.cart.draft", id);
  }
  return id;
}
