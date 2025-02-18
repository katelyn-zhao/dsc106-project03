let fTempData = [];
let mTempData = [];

async function loadData() {
    const rawFemaleData = await d3.csv("f_temp.csv");
    const rawMaleData = await d3.csv("m_temp.csv");

    // Process female data
    fTempData = rawFemaleData.map((row, index) => {
        const processedRow = {
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
            f13: Number(row.f13)
        };
        
        const femaleValues = Object.entries(row)
            .filter(([key]) => key.startsWith('f'))
            .map(([, value]) => Number(value));
        processedRow.fAvg = femaleValues.reduce((a, b) => a + b, 0) / femaleValues.length;
        
        return processedRow;
    });

    mTempData = rawMaleData.map((row, index) => {
        const processedRow = {
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
            m13: Number(row.m13)
        };
        
        const maleValues = Object.entries(row)
            .filter(([key]) => key.startsWith('m'))
            .map(([, value]) => Number(value));
        processedRow.mAvg = maleValues.reduce((a, b) => a + b, 0) / maleValues.length;
        
        return processedRow;
    });

    populateColumnDropdowns();
}

function populateColumnDropdowns() {
    const femaleSelect = document.getElementById("femaleSelect");
    const maleSelect = document.getElementById("maleSelect");
    
    femaleSelect.innerHTML = "";
    maleSelect.innerHTML = "";

    let fAvgOption = document.createElement("option");
    fAvgOption.value = "fAvg";
    fAvgOption.textContent = "Average (f)";
    femaleSelect.appendChild(fAvgOption);

    let mAvgOption = document.createElement("option");
    mAvgOption.value = "mAvg";
    mAvgOption.textContent = "Average (m)";
    maleSelect.appendChild(mAvgOption);

    const femaleColumns = Object.keys(fTempData[0]).filter(d => d !== "minute" && d !== "fAvg");
    const maleColumns = Object.keys(mTempData[0]).filter(d => d !== "minute" && d !== "mAvg");

    femaleColumns.forEach(col => {
        let option = document.createElement("option");
        option.value = col;
        option.textContent = col;
        femaleSelect.appendChild(option);
    });

    maleColumns.forEach(col => {
        let option = document.createElement("option");
        option.value = col;
        option.textContent = col;
        maleSelect.appendChild(option);
    });

    femaleSelect.value = "fAvg";
    maleSelect.value = "mAvg";

    updateChart();
}

function createChart() {
    document.getElementById("femaleSelect").addEventListener("change", updateChart);
    document.getElementById("maleSelect").addEventListener("change", updateChart);
    document.getElementById("minTime").addEventListener("input", updateChart);
    document.getElementById("maxTime").addEventListener("input", updateChart);

    updateChart();
}

function updateChart() {
    const femaleColumn = document.getElementById("femaleSelect").value;
    const maleColumn = document.getElementById("maleSelect").value;
    const minTime = parseInt(document.getElementById("minTime").value);
    const maxTime = parseInt(document.getElementById("maxTime").value);

    if (!femaleColumn || !maleColumn) return;

    if (minTime > maxTime) {
        document.getElementById("minTime").value = maxTime;
        return;
    }

    const filteredFemaleData = fTempData.filter(d => d.minute >= minTime && d.minute <= maxTime);
    const filteredMaleData = mTempData.filter(d => d.minute >= minTime && d.minute <= maxTime);

    document.getElementById("minTimeValue").textContent = minTime;
    document.getElementById("maxTimeValue").textContent = maxTime;

    const width = 1000;
    const height = 500;
    const margin = { top: 50, right: 160, bottom: 60, left: 80 };

    d3.select("#chart").select("svg").remove();

    const svg = d3.select("#chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const yMin = Math.min(
        d3.min(filteredFemaleData, d => d[femaleColumn]),
        d3.min(filteredMaleData, d => d[maleColumn])
    );
    const yMax = Math.max(
        d3.max(filteredFemaleData, d => d[femaleColumn]),
        d3.max(filteredMaleData, d => d[maleColumn])
    );

    const xScale = d3.scaleLinear()
        .domain([minTime, maxTime])
        .range([0, width]);

    const yScale = d3.scaleLinear()
        .domain([yMin, yMax])
        .range([height, 0]);

    const femaleLine = d3.line()
        .x(d => xScale(d.minute))
        .y(d => yScale(d[femaleColumn]))
        .curve(d3.curveMonotoneX);

    const maleLine = d3.line()
        .x(d => xScale(d.minute))
        .y(d => yScale(d[maleColumn]))
        .curve(d3.curveMonotoneX);

    svg.append("path")
        .datum(filteredFemaleData)
        .attr("fill", "none")
        .attr("stroke", "pink")
        .attr("stroke-width", 2)
        .attr("d", femaleLine);

    svg.append("path")
        .datum(filteredMaleData)
        .attr("fill", "none")
        .attr("stroke", "lightblue")
        .attr("stroke-width", 2)
        .attr("d", maleLine);

    const overlay = svg.append("g");
    filteredFemaleData.forEach((femalePoint, i) => {
        const malePoint = filteredMaleData[i];
        
        overlay.append("circle")
            .attr("cx", xScale(femalePoint.minute))
            .attr("cy", yScale(femalePoint[femaleColumn]))
            .attr("r", 1.5)
            .attr("fill", "pink")
            .attr("stroke", "none")
            .attr("stroke-width", 5)
            .on("mouseover", function(event) {
                const tooltipContent = `
                    <strong>Time:</strong> ${femalePoint.minute} min<br>
                    <strong>Female Temp:</strong> ${femalePoint[femaleColumn].toFixed(2)} °C<br>
                    <strong>Male Temp:</strong> ${malePoint[maleColumn].toFixed(2)} °C
                `;
                d3.select("#tooltip")
                    .style("display", "block")
                    .style("left", event.pageX + 10 + "px")
                    .style("top", event.pageY - 20 + "px")
                    .html(tooltipContent);

                overlay.selectAll("circle")
                    .filter(function() {
                        const cx = d3.select(this).attr("cx");
                        return cx === xScale(femalePoint.minute).toString();
                    })
                    .attr("r", 4);
            })
            .on("mouseout", function() {
                d3.select("#tooltip").style("display", "none");
                overlay.selectAll("circle").attr("r", 1.5);
            });

        overlay.append("circle")
            .attr("cx", xScale(malePoint.minute))
            .attr("cy", yScale(malePoint[maleColumn]))
            .attr("r", 1.5)
            .attr("fill", "lightblue")
            .attr("stroke", "none")
            .attr("stroke-width", 5)
            .on("mouseover", function(event) {
                const tooltipContent = `
                    <strong>Time:</strong> ${malePoint.minute} min<br>
                    <strong>Female Temp:</strong> ${femalePoint[femaleColumn].toFixed(2)} °C<br>
                    <strong>Male Temp:</strong> ${malePoint[maleColumn].toFixed(2)} °C
                `;
                d3.select("#tooltip")
                    .style("display", "block")
                    .style("left", event.pageX + 10 + "px")
                    .style("top", event.pageY - 20 + "px")
                    .html(tooltipContent);

                overlay.selectAll("circle")
                    .filter(function() {
                        const cx = d3.select(this).attr("cx");
                        return cx === xScale(malePoint.minute).toString();
                    })
                    .attr("r", 4);
            })
            .on("mouseout", function() {
                d3.select("#tooltip").style("display", "none");
                overlay.selectAll("circle").attr("r", 1.5);
            });
    });

    const legend = svg.append("g")
        .attr("transform", `translate(${width + 10}, 0)`);

    legend.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", "pink");

    legend.append("text")
        .attr("x", 20)
        .attr("y", 12)
        .text(femaleColumn === "fAvg" ? "Female Average" : `Female (${femaleColumn})`);

    legend.append("rect")
        .attr("x", 0)
        .attr("y", 25)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", "lightblue");

    legend.append("text")
        .attr("x", 20)
        .attr("y", 37)
        .text(maleColumn === "mAvg" ? "Male Average" : `Male (${maleColumn})`);

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
        .text(`Temperature Data Comparison (${minTime} to ${maxTime} min)`);
}

document.addEventListener("DOMContentLoaded", async () => {
    await loadData();
    createChart();
});