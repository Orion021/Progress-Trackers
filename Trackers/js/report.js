async function generateReport() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  // Ask only for user name
  const userName = prompt("Enter your name:");
  if (!userName) return alert("Report cancelled: name required.");

  // Automatically get current date & time (12-hour format)
  const now = new Date();
  const reportDate = now.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const genTime = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  // --- HEADER ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.text("C Fundamentals Progress Report", 14, 20);

  // --- USER INFO ---
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  let y = 35;
  doc.text(`Name: ${userName}`, 14, y);
  doc.text(`Date: ${reportDate}`, 14, y + 6);
  doc.text(`Generated at: ${genTime}`, 14, y + 12);
  y += 25;

  // --- PROGRESS SUMMARY ---
  let totalTopics = 0,
    completed = 0;
  Object.entries(sections).forEach(([section, topics]) => {
    totalTopics += topics.length;
    topics.forEach((_, i) => {
      if (localStorage.getItem(`${section}-${i}`) === "1") completed++;
    });
  });
  const overallPercent = totalTopics
    ? Math.round((completed / totalTopics) * 100)
    : 0;

  // Display summary text
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(`Overall Progress: ${overallPercent}%`, 14, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(`Completed ${completed} of ${totalTopics} topics`, 14, y + 8);
  y += 25;

  // --- SECTION DETAILS ---
  Object.entries(sections).forEach(([section, topics]) => {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    // Section title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(section, 14, y);
    y += 6;

    // Table columns
    const startX = 14,
      colWidths = [10, 130, 40];
    let rowY = y + 6;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);

    // Table header
    doc.text("#", startX + 2, rowY);
    doc.text("Topic", startX + 15, rowY);
    doc.text("Status", startX + 155, rowY);
    rowY += 3;
    doc.setLineWidth(0.2);
    doc.line(10, rowY, 200, rowY);
    rowY += 5;

    // Table rows
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    topics.forEach((topic, i) => {
      if (rowY > 275) {
        doc.addPage();
        rowY = 20;
      }

      const done = localStorage.getItem(`${section}-${i}`) === "1";
      const status = done ? "Completed" : "Not Completed";

      doc.text(String(i + 1), startX + 2, rowY);
      doc.text(topic, startX + 15, rowY, { maxWidth: colWidths[1] });
      doc.text(status, startX + 155, rowY);
      rowY += 6;
    });

    doc.line(10, rowY, 200, rowY);
    y = rowY + 10;
  });

  // --- FOOTER ---
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text(`Page ${i} of ${totalPages}`, 200, 290, { align: "right" });
    doc.text(
      "Generated using the C Fundamentals Tracker - Owned By https://orion021.github.io/krishnan_t/",
      105,
      290,
      { align: "center" }
    );
  }

  // Save final file
  doc.save(`C_Fundamentals_Report_${userName.replace(/\s+/g, "_")}.pdf`);
}
