document.querySelectorAll(".portfolio-editorial").forEach((section) => {
  const buttons = section.querySelectorAll(".editorial-progress button");
  const cards = section.querySelectorAll(".editorial-card");

  function setActive(index) {
    const isReverse = section.classList.contains("reverse");

    cards.forEach((card) => {
      card.classList.remove("is-active", "is-next");
    });

    buttons.forEach((button) => {
      button.classList.remove("active");
    });

    cards[index]?.classList.add("is-active");

    if (isReverse) {
      cards[index - 1]?.classList.add("is-next");
    } else {
      cards[index + 1]?.classList.add("is-next");
    }

    const buttonIndex = isReverse
  ? index - 1
  : index;

buttons[buttonIndex]?.classList.add("active");
  }

  buttons.forEach((button, index) => {
    button.addEventListener("click", () => {
      const targetIndex = section.classList.contains("reverse")
        ? index + 1
        : index;

      cards[targetIndex]?.scrollIntoView({
        behavior: "smooth",
        inline: section.classList.contains("reverse") ? "end" : "start",
        block: "nearest",
      });

      setActive(targetIndex);
    });
  });

  const defaultIndex = section.classList.contains("reverse")
    ? cards.length - 1
    : 0;

  setActive(defaultIndex);

  cards[defaultIndex]?.scrollIntoView({
    behavior: "auto",
    inline: section.classList.contains("reverse") ? "end" : "start",
    block: "nearest",
  });
});