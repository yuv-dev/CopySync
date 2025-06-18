//Manually read clipboard function: A fallback function
exports.manualReadFromClipboard = async (setXClipboard, lastClipboard) => {
  try {
    const current = await navigator.clipboard.readText();
    if (current && current !== lastClipboard.current) {
      lastClipboard.current = current;
      localStorage.setItem("lastClipboard", current);
      setXClipboard((prev) => [current, ...prev]);

      await fetch("/api/clipboard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${JSON.parse(
            localStorage.getItem("clipSync-token")
          )}`,
        },
        body: JSON.stringify({ text: current }),
      });
    }
  } catch (err) {
    console.warn("Manual clipboard access failed", err);
  }
};
