let fTempData = [];
let mTempData = [];

async function loadData() {
    fTempData = await d3.csv("f_temp.csv", (row, index) => ({
        minute: index,
        f1: Number(row.f1),
        f2: Number(row.f2),
        f3: Number(row.f3),
        f4: Number(row.f4),
        f5: Number(row.f5),
        f6: Number(row.f6),
        f7: Number(row.f7),
        f8: Number(row.f8),
        f9: Number(row.f9),
        f10: Number(row.f10),
        f11: Number(row.f11),
        f12: Number(row.f12),
        f13: Number(row.f13),
    }));

    mTempData = await d3.csv("m_temp.csv", (row, index) => ({
        minute: index,
        m1: Number(row.m1),
        m2: Number(row.m2),
        m3: Number(row.m3),
        m4: Number(row.m4),
        m5: Number(row.m5),
        m6: Number(row.m6),
        m7: Number(row.m7),
        m8: Number(row.m8),
        m9: Number(row.m9),
        m10: Number(row.m10),
        m11: Number(row.m11),
        m12: Number(row.m12),
        m13: Number(row.m13),
    }));

    console.log("Female Temp Data:", fTempData);
    console.log("Male Temp Data:", mTempData);

    populateColumnDropdown(); 
}

function populateColumnDropdown() {
    const datasetSelect = document.getElementById("datasetSelect");
    const columnSelect = document.getElementById("columnSelect");
    columnSelect.innerHTML = ""; 

    const dataset = datasetSelect.value === "fTempData" ? fTempData : mTempData;
    const columns = Object.keys(dataset[0]).filter(d => d !== "minute");

    columns.forEach(col => {
        let option = document.createElement("option");
        option.value = col;
        option.textContent = col;
        columnSelect.appendChild(option);
    });

    updateChart();
}

function createChart() {
    document.getElementById("datasetSelect").addEventListener("change", populateColumnDropdown);
    document.getElementById("columnSelect").addEventListener("change", updateChart);
    document.getElementById("minTime").addEventListener("input", updateChart);
    document.getElementById("maxTime").addEventListener("input", updateChart);

    updateChart(); 
}

function updateChart() {
    const datasetSelect = document.getElementById("datasetSelect").value;
    const columnSelect = document.getElementById("columnSelect").value;
    const minTime = parseInt(document.getElementById("minTime").value);
    const maxTime = parseInt(document.getElementById("maxTime").value);

    const dataset = datasetSelect === "fTempData" ? fTempData : mTempData;

    if (!columnSelect) return;

    if (minTime > maxTime) {
        document.getElementById("minTime").value = maxTime;
        return;
    }

    const filteredData = dataset.filter(d => d.minute >= minTime && d.minute <= maxTime);

    document.getElementById("minTimeValue").textContent = minTime;
    document.getElementById("maxTimeValue").textContent = maxTime;

    const width = 1000;
    const height = 500;
    const margin = { top: 50, right: 120, bottom: 60, left: 80 }; 

    d3.select("#chart").select("svg").remove();

    const svg = d3.select("#chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleLinear()
        .domain([minTime, maxTime])
        .range([0, width]);

    const yScale = d3.scaleLinear()
        .domain([d3.min(filteredData, d => d[columnSelect]), d3.max(filteredData, d => d[columnSelect])])
        .range([height, 0]);

    const color = datasetSelect === "fTempData" ? "pink" : "lightblue";

    const line = d3.line()
        .x(d => xScale(d.minute))
        .y(d => yScale(d[columnSelect]))
        .curve(d3.curveMonotoneX);

    svg.append("path")
        .datum(filteredData)
        .attr("fill", "none")
        .attr("stroke", color)
        .attr("stroke-width", 2)
        .attr("d", line);

    svg.selectAll("circle")
        .data(filteredData)
        .enter()
        .append("circle")
        .attr("cx", d => xScale(d.minute))
        .attr("cy", d => yScale(d[columnSelect]))
        .attr("r", 1.5)
        .attr("fill", color)
        .attr("stroke", "none")
        .attr("stroke-width", 5)
        .on("mouseover", function (event, d) {
            d3.select("#tooltip")
                .style("display", "block")
                .style("left", event.pageX + 10 + "px")
                .style("top", event.pageY - 20 + "px")
                .html(`<strong>Time:</strong> ${d.minute} min<br><strong>Temp:</strong> ${d[columnSelect]} °C`);
        })
        .on("mousemove", function (event) {
            d3.select("#tooltip")
                .style("left", event.pageX + 10 + "px")
                .style("top", event.pageY - 20 + "px");
        })
        .on("mouseout", function () {
            d3.select("#tooltip").style("display", "none");
        });

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale).ticks(10));

    svg.append("g")
        .call(d3.axisLeft(yScale));

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + 40) 
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Time (Minutes)");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -50)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Temperature (°C)");

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -20)
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .text(`Temperature Data: ${datasetSelect} - ${columnSelect} (${minTime} to ${maxTime} min)`);
}


document.addEventListener("DOMContentLoaded", async () => {
    await loadData();
    createChart();
});