const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, HeadingLevel, AlignmentType, BorderStyle, TableLayoutType, PageBreak } = require("docx");
const fs = require("fs");

// Helper functions
function h1(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 }, children: [new TextRun({ text, bold: true, size: 32, font: "Helvetica Neue" })] });
}
function h2(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 150 }, children: [new TextRun({ text, bold: true, size: 26, font: "Helvetica Neue" })] });
}
function h3(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_3, spacing: { before: 200, after: 100 }, children: [new TextRun({ text, bold: true, size: 22, font: "Helvetica Neue" })] });
}
function p(text) {
  return new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text, size: 20, font: "Helvetica Neue" })] });
}
function pBold(text) {
  return new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text, bold: true, size: 20, font: "Helvetica Neue" })] });
}
function bullet(text) {
  return new Paragraph({ bullet: { level: 0 }, spacing: { after: 80 }, children: [new TextRun({ text, size: 20, font: "Helvetica Neue" })] });
}
function bulletBold(label, text) {
  return new Paragraph({ bullet: { level: 0 }, spacing: { after: 80 }, children: [
    new TextRun({ text: label + ": ", bold: true, size: 20, font: "Helvetica Neue" }),
    new TextRun({ text, size: 20, font: "Helvetica Neue" })
  ]});
}
function makeTable(headers, rows) {
  const borderStyle = { style: BorderStyle.SINGLE, size: 1, color: "999999" };
  const borders = { top: borderStyle, bottom: borderStyle, left: borderStyle, right: borderStyle };
  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map(h => new TableCell({
      borders,
      shading: { fill: "2C3E50", color: "FFFFFF" },
      children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: h, bold: true, size: 18, font: "Helvetica Neue", color: "FFFFFF" })] })]
    }))
  });
  const dataRows = rows.map((row, idx) => new TableRow({
    children: row.map(cell => new TableCell({
      borders,
      shading: idx % 2 === 0 ? { fill: "F8F9FA" } : {},
      children: [new Paragraph({ children: [new TextRun({ text: String(cell), size: 17, font: "Helvetica Neue" })] })]
    }))
  }));
  return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, layout: TableLayoutType.AUTOFIT, rows: [headerRow, ...dataRows] });
}
function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

// ============================================================
// BUILD THE REPORT
// ============================================================
const children = [];

// TITLE PAGE
children.push(new Paragraph({ spacing: { before: 2000 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "OMS Full Investigation Report", bold: true, size: 48, font: "Helvetica Neue" })] }));
children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: "Pipeline Assessment + Data-Validated Findings", size: 28, font: "Helvetica Neue", color: "666666" })] }));
children.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Tania Bottled Drinking Water — tania_omsdsdb01", size: 24, font: "Helvetica Neue", color: "888888" })] }));
children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 400 }, children: [new TextRun({ text: "March 2026 | Confidential", size: 22, font: "Helvetica Neue", color: "999999" })] }));
children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 200 }, children: [new TextRun({ text: "Database: 2.14M orders (Jan-Nov 2025) | 212 tables | 44GB", size: 20, font: "Helvetica Neue", color: "AAAAAA" })] }));
children.push(pageBreak());

// ===========================================
// SECTION A: EXECUTIVE SUMMARY
// ===========================================
children.push(h1("A. Executive Summary"));
children.push(p("This report presents findings from a comprehensive investigation of Tania Water's Order Management System (OMS) database (tania_omsdsdb01), validated against MATLAB-generated analytical files derived from a limited DWH extract. The investigation covers 2,143,961 orders from January to November 2025 across 212 database tables totaling 44GB."));

children.push(h3("Biggest Confirmed Risks"));
children.push(bullet("FRAUD: SAR 99,999,999.99 single WhatsApp order (order #586145000001) — fake COD order, canceled. Additional SAR 2.18M WhatsApp fake order in June. Total: SAR 102.2M in fraudulent order value from just 3 orders."));
children.push(bullet("FRAUD-RISK: 9 agency routes (ARAG01, BHAG01, JIAG01, etc.) show 42-92% cancel rates, ALL 100% COD, consistent fraud/control-break pattern."));
children.push(bullet("COD RISK: SAR 335M flows through COD (69.8% of orders). COD cancel rate 2.4% vs non-COD 1.6% — but in specific segments (call center, agency routes) COD cancel reaches 10-92%."));

children.push(h3("Biggest Operational Failures"));
children.push(bullet("March 2025 systemic crisis: Cancel rate spiked to 3.48% (3.3x January), with March 1st at 9.08%. Affected all channels — iOS cancel rate hit 9.05% (3x normal)."));
children.push(bullet("Geographic hotspots: Abha (26.2% cancel), Taif (21.2%), Madinah (20.2%), Makkah (15.9%) — all far above the 2.3% national baseline."));
children.push(bullet("Cancel reason opacity: 72.7% of cancellations tagged as 'Other' — root cause analysis impossible."));

children.push(h3("Biggest Data/Pipeline Failures"));
children.push(bullet("delivery_date field: 0% populated for all 2025 orders — late delivery KPI cannot be computed from the orders table."));
children.push(bullet("ERP sync degradation: Missing erp_id rate grew from 0.93% (Jan) to 2.00% (Sep) — 115% increase in 9 months."));
children.push(bullet("CSV pipeline captures only 29% of actual orders (677K vs 2.14M) due to filter logic gap. The CSV excludes source_id=13 (driver_app) which is 63% of all orders."));
children.push(bullet("preferred_date: 0% populated — requested delivery date tracking is non-functional."));

children.push(h3("What Must Be Fixed First"));
children.push(bullet("1. Investigate and block fraudulent WhatsApp orders — implement order value caps and COD verification."));
children.push(bullet("2. Audit all 9 agency routes — ARAG01 (92.1% cancel), BHAG01 (68.9%), JIAG01 (55.0%) require immediate operational review."));
children.push(bullet("3. Populate delivery_date field — currently 100% NULL, making late delivery tracking impossible."));
children.push(bullet("4. Fix cancel reason taxonomy — 72.7% 'Other' makes root cause analysis impossible."));
children.push(bullet("5. Fix CSV pipeline filter to include all orders, not just 29% — or build proper analytical marts."));
children.push(pageBreak());

// ===========================================
// SECTION B: FILE-BY-FILE SUMMARY
// ===========================================
children.push(h1("B. File-by-File Summary"));

children.push(h3("1. Monthly_KPIs.csv"));
children.push(p("Contains: 11 rows (Jan-Nov 2025), 29 columns. Grain: monthly aggregate. Shows ~677K total orders with 4.26% cancel rate, SAR 93.1M net revenue, 43.8% COD share, 9.8% late rate."));
children.push(p("Key discrepancy: DB shows 2.14M orders with 2.19% cancel rate and 69.8% COD share. The CSV captures only 29% of orders. The COD share discrepancy (43.8% vs 69.8%) is because the CSV excludes driver_app (source 13) which is 90% COD and 63% of volume."));
children.push(p("Fragile due to: Population filter excluding majority of orders. Late rate (9.8%) cannot be validated — delivery_date is 100% NULL in DB."));

children.push(h3("2. Daily_Anomalies.csv"));
children.push(p("Contains: 14 flagged anomaly days with z-scores across cancel rate, late rate, SAP missing rate. Grain: daily. Date range: Jan-Nov 2025."));
children.push(p("DB validation: Daily patterns partially confirmed. Mar 1 (9.08% cancel in DB vs 14.6% in CSV) and Feb 28 (6.34% vs 6.63%) show directional alignment but different magnitudes due to different population bases."));
children.push(p("Fragile due to: Z-scores computed on filtered 29% population. Anomaly thresholds would shift with full population."));

children.push(h3("3. Source_Ranking_ByMonth.csv"));
children.push(p("Contains: 55 rows across 11 months, 5-7 sources per month (call center, ios, android, driver_app, web, salla). Key finding: WhatsApp SAR 2,842 AOV, driver_app 0% cancel."));
children.push(p("DB validation: WhatsApp extreme AOV CONFIRMED — driven by SAR 99.9M fake order. Driver_app cancel rate is 0.13-0.28% in DB (not exactly 0% but near-zero). Call center 11% cancel confirmed. Salla 7-14% cancel confirmed."));
children.push(p("Fragile due to: CSV driver_app counts (~7-10K/month) vs DB driver_app counts (~111-133K/month) — CSV captured only ~7% of driver_app orders."));

children.push(h3("4. Route_Ranking_ByMonth.csv"));
children.push(p("Contains: ~60 HD routes per month with cancel rates, AOV, COD share. Shows HDMD02 9.1%, HDAB01 6.9% as worst performers in January."));
children.push(p("DB validation: Route-level patterns directionally confirmed. HDAB02 28.5% cancel, HDAB01 24.3%, HDTF02 23.5% are worst HD routes in DB. Rankings differ because DB includes full population."));
children.push(p("Fragile due to: Excludes all agency (AG) routes which are the worst performers (42-92% cancel). Route population limited to HD prefix only."));

children.push(h3("5. City_Ranking_ByMonth.csv"));
children.push(p("Contains: 7-15 cities per month. Shows Riyadh at 53% of volume with low cancel rate. Taif, Khamis Mushayt, Madinah as problem cities in March."));
children.push(p("DB validation: City patterns CONFIRMED. Abha 26.2%, Taif 21.2%, Madinah 20.2% cancel rates validated against full DB. Riyadh 3.57% cancel with 515K orders confirmed as dominant."));
children.push(p("Fragile due to: City derived from route_code prefix — fragile mapping. Some cities may be misclassified."));

children.push(h3("6. Slot_Ranking_ByMonth.csv"));
children.push(p("Contains: 2 slots (Morning/Evening) x 11 months. Shows Evening ~2x worse cancel rate than Morning."));
children.push(p("DB validation: PARTIALLY CONFIRMED but with major caveat. DB delivery_time field has 6+ formats: 'Morning', 'Evening', '12 PM - 1 PM', Arabic text. The majority (1.19M) are '12 PM - 1 PM' which maps to neither Morning nor Evening. Evening (26K orders) has 3.76% cancel vs Morning (187K) at 1.71%."));
children.push(p("Fragile due to: Slot normalization logic not standardized. Arabic/English/time-range formats create mapping ambiguity."));

children.push(h3("7. Behavioral_Anomalies_May_Oct_2025.pptx"));
children.push(p("Contains: 8 slides covering May-October 2025. Highlights: JIAG01 79.5% cancel (Sep), WhatsApp SAR 32K AOV (Jun), COD 5-7x riskier, SAP missing growing 2.5% to 4.5%."));
children.push(p("DB validation: JIAG01 79.5% Sep cancel CONFIRMED (73 orders, 58 canceled, all COD). WhatsApp Jun AOV driven by SAR 2.18M fake order CONFIRMED. SAP missing trend CONFIRMED (0.93% to 2.00% in DB — slightly lower magnitude but same direction)."));
children.push(p("Fragile due to: Based on same filtered CSV population. Some absolute numbers differ but directional findings are robust."));
children.push(pageBreak());

// ===========================================
// SECTION C: ATTACHMENT-DERIVED HYPOTHESES
// ===========================================
children.push(h1("C. Attachment-Derived Hypotheses and KPI Reconstruction"));

children.push(h3("Inferred KPI Definitions"));
children.push(makeTable(
  ["KPI", "CSV Formula", "DB Equivalent", "Match Status"],
  [
    ["CancelRate", "Canceled / Orders", "SUM(status_id=6) / COUNT(*)", "Formula matches; population differs"],
    ["LateRate", "Late / LateBase (=Delivered)", "CANNOT VALIDATE", "delivery_date is 100% NULL"],
    ["DelMissingSAPRate", "DelMissingSAP / Delivered", "SUM(erp_id IS NULL & delivered) / delivered", "Formula matches; rates differ (CSV 0.6% vs DB 0.93-2.0%)"],
    ["CODShare", "COD / Total", "SUM(pm='COD') / COUNT(*)", "Formula matches; CSV 43.8% vs DB 69.8%"],
    ["CODCancelRate", "COD canceled / COD total", "Same logic", "Direction confirmed; magnitude differs"],
    ["AOV", "NetSum / Orders", "SUM(grand_total) / COUNT(*)", "Inflated by fake WhatsApp orders"],
    ["FreeShare", "FreeQTY / TotalQTY", "Requires order_items join", "Not directly validated"],
    ["UpdatedLag", "AVG(updated_at - created_at)", "Same logic possible", "Not priority for validation"]
  ]
));

children.push(h3("Key Hypotheses Validated"));
children.push(makeTable(
  ["Hypothesis", "Source", "DB Validation", "Status"],
  [
    ["JIAG01 79.5% cancel (Sep)", "PPTX", "73 orders, 58 canceled = 79.5%", "CONFIRMED"],
    ["WhatsApp SAR 102M fraud", "CSV/PPTX", "SAR 99.99M (Apr) + SAR 2.18M (Jun) = SAR 102.2M", "CONFIRMED"],
    ["Agency routes 42-92% cancel, 100% COD", "Prior report", "9 AG routes, 42-92% cancel, all 100% COD", "CONFIRMED"],
    ["March 2025 systemic crisis", "CSV", "Mar cancel 3.48% (3.3x Jan), Mar 1 at 9.08%", "CONFIRMED"],
    ["COD 5-7x riskier", "PPTX", "DB shows 2.1-4.6x ratio (lower than CSV)", "PARTIALLY CONFIRMED"],
    ["SAP missing rate growing", "PPTX", "0.93% (Jan) to 2.00% (Sep) = 115% increase", "CONFIRMED"],
    ["Evening slot 2x worse", "CSV", "Evening 3.76% vs Morning 1.71% = 2.2x", "PARTIALLY CONFIRMED"],
    ["Driver app 0% cancel", "CSV", "DB: 0.13-0.28% (near-zero, not exactly zero)", "PARTIALLY CONFIRMED"],
    ["CSV captures 74% of orders", "Prior report", "CSV captures only 29% (677K / 2.14M)", "REJECTED — gap is worse"]
  ]
));

children.push(h3("Priority Validation Items"));
children.push(bullet("Late delivery rate CANNOT be validated — delivery_date is 0% populated. This is the single biggest data quality blocker."));
children.push(bullet("COD risk ratio is lower in DB (2-4.6x) vs CSV claim (5-7x) — the filtered population in CSV amplified the COD effect."));
children.push(bullet("CSV population gap is 71% (not 26% as previously estimated) — driver_app orders dominate the DB but are underrepresented in CSV."));
children.push(pageBreak());

// ===========================================
// SECTION D: REAL DATABASE SCHEMA MAPPING
// ===========================================
children.push(h1("D. Real Database Schema Mapping"));

children.push(h3("Core Tables"));
children.push(makeTable(
  ["Table", "Rows", "Size", "Grain", "PK", "Key Join Fields", "Purpose"],
  [
    ["orders", "4.6M", "2.7GB", "1 row per order", "order_id", "customer_id, shipping_address_id, source_id, order_status_id, assigned_trip", "Order header with status, payment, timestamps"],
    ["order_items", "5.9M", "651MB", "1 row per line item", "order_item_id", "order_id, product_id, variant_id", "Line items with qty, price, FOC flags"],
    ["order_histories", "3.8M", "234MB", "1 row per status event", "id", "order_id, route_id, store_id", "Status transitions with driver/vehicle assignment"],
    ["deliveries", "1.6M", "189MB", "1 row per delivery event", "id (implicit)", "order_id, driver_id, vehicle_id, route_id, store_id", "Delivery execution records"],
    ["addresses", "~1M+", "232MB", "1 row per address", "address_id", "route_id, customer_id", "Address master with route linkage"],
    ["routes", "~200", "352KB", "1 row per route", "route_id", "route_code", "Route master (HD=Home Delivery, AG=Agency)"],
    ["customers", "~891K", "456MB", "1 row per customer", "customer_id", "mobile, email", "Customer master"],
    ["cancel_reasons", "5 rows", "small", "1 row per reason", "cancel_reason_id", "—", "5 reasons (72.7% = 'Other')"],
    ["order_statuses", "13 rows", "small", "1 row per status", "order_status_id", "key", "PLACED(5), CONFIRMED(2), ASSIGNED(13), READY(14), SHIPPED(3), DELIVERED(4), CANCELED(6)"]
  ]
));

children.push(h3("Key Join Paths"));
children.push(bullet("Orders → Routes (via addresses): orders.shipping_address_id → addresses.address_id → addresses.route_id → routes.route_id"));
children.push(bullet("Orders → Routes (via trips): orders.assigned_trip → delivery_trips.trip_id → delivery_trips.route_id → routes.route_id (BUT assigned_trip is 0% populated for 2025)"));
children.push(bullet("Orders → Delivery: orders.order_id → deliveries.order_id (1.6M deliveries vs 4.6M orders — not 1:1)"));
children.push(bullet("Orders → Status History: orders.order_id → order_histories.order_id (multiple rows per order)"));
children.push(bullet("City derivation: Extracted from route_code prefix (HDRI=Riyadh, HDDM=Dammam, etc.) — NO dedicated city dimension table"));

children.push(h3("Critical Structural Weaknesses"));
children.push(makeTable(
  ["Issue", "Impact", "Severity"],
  [
    ["delivery_date: 0% populated (2025)", "Late delivery KPI impossible to compute", "CRITICAL"],
    ["preferred_date: 0% populated", "Requested delivery date tracking non-functional", "CRITICAL"],
    ["assigned_trip: 0% populated (2025)", "Trip-based route assignment not usable", "HIGH"],
    ["Only 2 foreign keys in entire 212-table schema", "Near-zero referential integrity", "HIGH"],
    ["9 different collations across tables", "Character set chaos, join failures possible", "MEDIUM"],
    ["47 completely empty tables", "Schema bloat, maintenance overhead", "LOW"],
    ["27GB of log tables (notification_logs, driver_app_requests_log, erp_req_response)", "Storage cost, query performance risk", "MEDIUM"],
    ["No city/geography dimension table", "City derived from route_code prefix — fragile", "HIGH"],
    ["No standardized source/channel dimension", "source_id is VARCHAR, inconsistent mapping", "MEDIUM"],
    ["cancel_reason: 72.7% = 'Other'", "Root cause analysis impossible", "HIGH"],
    ["actual_delivery_date: only 36% populated for delivered orders", "Delivery timing analysis limited", "HIGH"]
  ]
));
children.push(pageBreak());

// ===========================================
// SECTION E: PIPELINE RECOMMENDATIONS
// ===========================================
children.push(h1("E. Recommended Additional Pipeline Structures"));
children.push(p("The following structures are RECOMMENDATIONS ONLY. They should not be created without explicit approval and proper implementation planning."));

// Recommendation 1
children.push(h3("1. fact_order_lifecycle"));
children.push(bulletBold("Purpose", "Single denormalized fact table tracking every order from creation through delivery/cancellation with all timestamps"));
children.push(bulletBold("Grain", "1 row per order"));
children.push(bulletBold("Source Tables", "orders, order_items (aggregated), addresses, routes, deliveries, order_histories (pivoted)"));
children.push(bulletBold("Key Columns", "order_id, created_at, confirmed_at, assigned_at, shipped_at, delivered_at, cancelled_at, route_code, city, source_id, payment_method, grand_total, cancel_reason, erp_id, is_late, is_cod, lifecycle_minutes"));
children.push(bulletBold("Gap Solved", "Currently requires 4+ table joins to reconstruct order lifecycle. No single table has all timestamps. status_delivered, status_cancelled exist on orders but status_confirmed, status_assigned do not."));
children.push(bulletBold("Why Current Schema Insufficient", "The orders table has partial timestamps (status_delivered, status_cancelled, status_erp, status_driver) but misses confirmed/assigned/shipped timestamps. Order_histories has events but requires complex pivoting. No analyst can reliably compute order lifecycle without expert SQL."));
children.push(bulletBold("Update Cadence", "Daily or near-real-time"));
children.push(bulletBold("Primary Beneficiary", "IT, Logistics, Sales — all teams need reliable lifecycle metrics"));

// Recommendation 2
children.push(h3("2. fact_order_status_transition"));
children.push(bulletBold("Purpose", "Track every status change with timestamps, enabling status lag analysis and transition anomaly detection"));
children.push(bulletBold("Grain", "1 row per status transition per order"));
children.push(bulletBold("Source Tables", "order_histories, orders"));
children.push(bulletBold("Key Columns", "order_id, from_status, to_status, transition_at, lag_minutes_from_previous, agent_type (system/driver/admin)"));
children.push(bulletBold("Gap Solved", "order_histories exists but has no explicit from_status/to_status. It captures events but not transitions. Cannot detect out-of-sequence status changes."));
children.push(bulletBold("Why Needed", "Enables: status lag monitoring, out-of-sequence detection, operational bottleneck identification, SLA compliance tracking"));

// Recommendation 3
children.push(h3("3. dim_geo_standardized"));
children.push(bulletBold("Purpose", "Proper city/region/area dimension replacing fragile route_code prefix extraction"));
children.push(bulletBold("Grain", "1 row per route_code, mapping to city, region, area, branch"));
children.push(bulletBold("Source Tables", "routes (route_code), manual mapping table"));
children.push(bulletBold("Key Columns", "route_code, city_name, region_name, area_name, branch_code, route_type (HD/AG/other), is_active"));
children.push(bulletBold("Gap Solved", "Currently city is derived by parsing route_code prefix (HDRI→Riyadh). This breaks for AG routes, new route codes, or inconsistent naming. No authoritative geography dimension exists."));

// Recommendation 4
children.push(h3("4. dim_channel_standardized"));
children.push(bulletBold("Purpose", "Clean source/channel dimension mapping source_id to business-meaningful categories"));
children.push(bulletBold("Grain", "1 row per source_id"));
children.push(bulletBold("Source Tables", "Logical mapping (source_id is VARCHAR in orders table, no reference table found)"));
children.push(bulletBold("Key Columns", "source_id, source_name, channel_group (digital/field/marketplace), is_b2b, is_active"));
children.push(bulletBold("Gap Solved", "source_id values (1,3,8,9,10,11,13,14) have no reference table. Analysts must hardcode mappings. source_id is VARCHAR not INT — inconsistent typing."));

// Recommendation 5
children.push(h3("5. dq_order_completeness_daily"));
children.push(bulletBold("Purpose", "Daily data quality monitoring for critical order fields"));
children.push(bulletBold("Grain", "1 row per day"));
children.push(bulletBold("Source Tables", "orders"));
children.push(bulletBold("Key Columns", "date, total_orders, pct_missing_delivery_date, pct_missing_erp_id, pct_missing_actual_delivery_date, pct_missing_cancel_reason, pct_missing_route, pct_zero_grand_total"));
children.push(bulletBold("Gap Solved", "No monitoring of data quality trends. ERP sync degradation (0.93%→2.00%) was only discovered via manual investigation. Should be auto-detected."));

// Recommendation 6
children.push(h3("6. dq_sap_linkage_daily"));
children.push(bulletBold("Purpose", "Monitor ERP/SAP sync completeness and lag"));
children.push(bulletBold("Grain", "1 row per day"));
children.push(bulletBold("Source Tables", "orders (erp_id, status_erp), erp_req_response"));
children.push(bulletBold("Key Columns", "date, delivered_orders, missing_erp_count, missing_erp_pct, avg_erp_sync_lag_hours, failed_erp_requests"));
children.push(bulletBold("Gap Solved", "ERP sync degradation grew 115% over 9 months with no automated alerting. This table enables threshold-based monitoring."));

// Recommendation 7
children.push(h3("7. mart_monthly_ops_kpis"));
children.push(bulletBold("Purpose", "Pre-computed monthly operational KPIs replacing manual CSV exports"));
children.push(bulletBold("Grain", "1 row per month"));
children.push(bulletBold("Source Tables", "fact_order_lifecycle (or orders + joins)"));
children.push(bulletBold("Key Columns", "month, total_orders, delivered, canceled, cancel_rate, aov, cod_share, cod_cancel_rate, missing_erp_rate, late_rate (when delivery_date is fixed)"));
children.push(bulletBold("Gap Solved", "Currently depends on MATLAB scripts processing manual CSV exports that capture only 29% of orders. This mart would provide reliable, complete, automated KPIs."));

// Recommendation 8
children.push(h3("8. mart_route_monthly_scorecard"));
children.push(bulletBold("Purpose", "Monthly route-level performance scorecard"));
children.push(bulletBold("Grain", "1 row per route per month"));
children.push(bulletBold("Source Tables", "orders, addresses, routes, dim_geo_standardized"));
children.push(bulletBold("Key Columns", "month, route_code, city, orders, cancel_rate, aov, cod_share, missing_erp_rate, peer_deviation_z_score"));
children.push(bulletBold("Gap Solved", "No automated route monitoring. JIAG01's 79.5% cancel rate persisted for months before manual investigation caught it. Route scorecards enable automated anomaly detection."));

// Recommendation 9
children.push(h3("9. mart_source_monthly_scorecard"));
children.push(bulletBold("Purpose", "Monthly source/channel quality scorecard"));
children.push(bulletBold("Grain", "1 row per source per month"));
children.push(bulletBold("Source Tables", "orders, dim_channel_standardized"));
children.push(bulletBold("Key Columns", "month, source_id, source_name, orders, cancel_rate, aov, cod_share, orders_above_10k (anomaly flag)"));
children.push(bulletBold("Gap Solved", "WhatsApp channel produced SAR 102M in fake orders over multiple months. Automated channel scoring would flag extreme AOV patterns."));

// Recommendation 10
children.push(h3("10. mart_daily_anomalies"));
children.push(bulletBold("Purpose", "Automated daily anomaly detection using z-score methodology"));
children.push(bulletBold("Grain", "1 row per day"));
children.push(bulletBold("Source Tables", "orders (daily aggregation)"));
children.push(bulletBold("Key Columns", "date, orders, cancel_rate, cancel_rate_z, erp_missing_rate, erp_missing_z, anomaly_flag"));
children.push(bulletBold("Gap Solved", "Currently requires MATLAB scripts on exported CSVs. This mart automates anomaly detection on complete data. Would have caught March 2025 crisis in real-time."));

// Recommendation 11
children.push(h3("11. fact_payment_risk"));
children.push(bulletBold("Purpose", "Payment-method-level risk scoring per order"));
children.push(bulletBold("Grain", "1 row per order"));
children.push(bulletBold("Source Tables", "orders, payments, payment_detail"));
children.push(bulletBold("Key Columns", "order_id, payment_method, is_cod, amount, cancel_risk_score (based on segment benchmarks), collection_status"));
children.push(bulletBold("Gap Solved", "COD risk is 2-4.6x worse than prepaid but not surfaced analytically. Preseller collections (SAR 611M through drivers) have no reconciliation layer."));

// Recommendation 12
children.push(h3("12. audit_cancel_reason_quality"));
children.push(bulletBold("Purpose", "Monitor cancel reason quality and force proper categorization"));
children.push(bulletBold("Grain", "1 row per day per cancel_reason"));
children.push(bulletBold("Source Tables", "orders, cancel_reasons"));
children.push(bulletBold("Key Columns", "date, cancel_reason_id, reason_text, count, pct_of_daily_cancels"));
children.push(bulletBold("Gap Solved", "72.7% of cancellations are tagged 'Other'. This audit table tracks the proportion of 'Other' daily and enables enforcement of proper categorization."));
children.push(pageBreak());

// ===========================================
// SECTION F: DEEP FINDINGS REPORT
// ===========================================
children.push(h1("F. Deep Findings Report"));

// F1: FRAUD INDICATORS
children.push(h2("F1. Possible Fraud / Control-Risk Indicators"));

children.push(h3("F1.1 WhatsApp Fake Orders — CONFIRMED FRAUD"));
children.push(p("Three WhatsApp (source_id=11) orders with extreme values totaling SAR 102.2M:"));
children.push(bullet("Order #586145000001 (Apr 23): SAR 99,999,999.99 — COD, Canceled"));
children.push(bullet("Order #717107000001 (Jun 28): SAR 2,180,400.00 — COD, Canceled"));
children.push(bullet("Order #160095000001 (Aug 6): SAR 31,397.76 — COD, Canceled"));
children.push(p("All three are COD, all canceled, all from WhatsApp channel. This inflated April 2025 DB revenue from ~SAR 38M to SAR 138M. The WhatsApp channel shows 25-39% cancel rate across all months, 100% COD, and is the only channel with consistent fraud indicators."));
children.push(p("Classification: CONFIRMED FRAUD-RISK INDICATOR. Confidence: HIGH. Owner: Digital Channels + IT (order value caps needed)."));

children.push(h3("F1.2 Agency Route Collapse — CONFIRMED CONTROL-RISK"));
children.push(p("9 agency routes (non-HD prefix) show extreme cancellation patterns:"));
children.push(makeTable(
  ["Route", "Orders", "Canceled", "Cancel %", "COD %", "Pattern"],
  [
    ["ARAG01", "76", "70", "92.1%", "100%", "100% cancel in Sep (13/13), 100% in Oct (29/29)"],
    ["AFAG01", "37", "29", "78.4%", "100%", "New route, immediate failure"],
    ["BHAG01", "135", "93", "68.9%", "100%", "76.7% Sep, 84.1% Oct"],
    ["SKAG01", "78", "52", "66.7%", "100%", "Persistent across all months"],
    ["QUAG01", "39", "26", "66.7%", "100%", "SAR 765 AOV (5x normal) — suspicious"],
    ["MKHAG01", "26", "16", "61.5%", "100%", "Small volume, high cancel"],
    ["JIAG01", "420", "231", "55.0%", "100%", "79.5% Sep, improving to 36.7% Nov"],
    ["MHAG01", "51", "28", "54.9%", "100%", "Consistent failure"],
    ["MDAG01", "895", "378", "42.2%", "100%", "Largest AG route by volume"]
  ]
));
children.push(p("Total: 1,757 agency orders, 897 canceled (51.1%), SAR 520K in canceled order value. All routes are 100% COD. This pattern is consistent with: (a) orders placed speculatively with no customer commitment, (b) driver/agent manipulation of order creation, or (c) service area mismatch where agency routes serve locations with no real delivery capability."));
children.push(p("Classification: CONFIRMED CONTROL-RISK INDICATOR. Confidence: HIGH. Owner: Sales + Logistics."));

children.push(h3("F1.3 Rapid Create-Cancel Pattern — PARTIALLY CONFIRMED"));
children.push(p("10,229 orders canceled within 5 minutes of creation (21.7% of all cancellations). Average order value for <5min cancels: SAR 277 (normal). However, 6-24hr cancels show SAR 23,270 AOV — 84x normal — indicating the extreme-value fake orders are canceled within that window."));
children.push(p("Classification: CONTROL-RISK INDICATOR. Confidence: MEDIUM. The <5min pattern alone is not necessarily fraud (customer changed mind), but the 6-24hr window with extreme AOV warrants investigation."));

children.push(h3("F1.4 Duplicate Order Patterns — PARTIALLY CONFIRMED"));
children.push(p("239 customer-day-amount groups with 4+ identical orders detected (1,189 total orders). This suggests either: systematic duplicate submission (integration bug), deliberate order padding, or legitimate recurring orders. Requires deeper investigation by customer segment."));
children.push(p("Classification: CONTROL-RISK INDICATOR. Confidence: LOW-MEDIUM. Owner: IT + Sales."));

// F2: PROCESS FAILURES
children.push(h2("F2. Process Failures"));

children.push(h3("F2.1 Cancel Reason Opacity — CONFIRMED"));
children.push(p("72.7% of all cancellations (34,161 out of 47,018) are tagged as 'Other'. The remaining reasons: 'Wrong product' (16.4%), 'Wrong address' (6.2%), 'Wrong payment type' (4.8%). This means root cause analysis for >70% of cancellations is impossible. No operational corrective action can be designed when the reason is unknown."));

children.push(h3("F2.2 March 2025 Systemic Crisis — CONFIRMED"));
children.push(p("March 2025 shows the worst performance across nearly all metrics: 3.48% cancel rate (3.3x Jan), Mar 1 alone: 9.08% cancel. iOS cancel rate jumped to 9.05% (3x normal). All cities affected. This was not a single-route issue — it was system-wide. Possible causes: Ramadan preparation disruption, system deployment issue, or supply chain constraint. Cannot determine root cause from available data."));

children.push(h3("F2.3 Geographic Service Quality Collapse — CONFIRMED"));
children.push(p("Five cities show cancel rates 5-25x the national baseline of 2.3%:"));
children.push(makeTable(
  ["City", "Orders", "Cancel Rate", "vs Baseline", "COD %"],
  [
    ["Abha", "5,663", "26.2%", "11.4x", "57.2%"],
    ["Taif", "8,678", "21.2%", "9.2x", "43.9%"],
    ["Madinah", "3,137", "20.2%", "8.8x", "45.3%"],
    ["Makkah", "15,810", "15.9%", "6.9x", "37.1%"],
    ["Al Khobar", "14,222", "8.5%", "3.7x", "37.7%"]
  ]
));
children.push(p("These 5 cities represent 47,510 orders with 10,675 cancellations — 22.7% of all national cancellations despite being only 5.2% of volume."));

children.push(h3("F2.4 delivery_date Field Non-Functional — CONFIRMED"));
children.push(p("The delivery_date field in the orders table is 0% populated for all 2,143,961 orders in 2025. This means: no scheduled delivery date is recorded, late delivery cannot be computed from the orders table, and SLA monitoring against promised dates is impossible. The actual_delivery_date field is only 36% populated for delivered orders."));

// F3: IT DISCREPANCIES
children.push(h2("F3. Key Discrepancies — IT Department"));

children.push(h3("F3.1 CSV Pipeline Captures Only 29% of Orders"));
children.push(p("The MATLAB-generated CSV files contain 677,837 orders. The database contains 2,143,961 orders for the same period. The CSV captures only 29.2% of actual volume. Root cause: The CSV pipeline appears to exclude source_id=13 (driver_app) which is 63.3% of all orders (1,356,959 orders). This means all CSV-derived KPIs, anomaly reports, and management dashboards are based on less than one-third of actual operations."));

children.push(h3("F3.2 ERP Sync Degradation"));
children.push(p("Missing erp_id rate for delivered orders grew from 0.93% (Jan) to 2.00% (Sep), a 115% increase. The erp_req_response table is 11GB, suggesting high ERP integration volume but with growing failure rates. Monthly missing ERP counts: Jan 1,521 → Sep 4,099 → Nov 3,486."));

children.push(h3("F3.3 Near-Zero Referential Integrity"));
children.push(p("Only 2 foreign key constraints exist across 212 tables. This means: orphaned records can accumulate silently, join integrity is not enforced, data quality depends entirely on application-layer logic, and schema changes can break relationships without database-level protection."));

children.push(h3("F3.4 No Analytical Marts or Semantic Layer"));
children.push(p("All analysis requires raw table joins with expert knowledge of undocumented join paths. No pre-computed KPI tables, no standardized dimensions, no data quality monitoring tables. Analysis currently depends on manual CSV exports processed through MATLAB — a fragile, incomplete, and non-scalable approach."));

children.push(h3("F3.5 source_id Typing Inconsistency"));
children.push(p("source_id is VARCHAR(100) but stores integer values (1,3,8,9,10,11,13,14). No reference/lookup table exists for source names. Analysts must hardcode mappings. This creates ambiguity and prevents self-service analytics."));

// F4: LOGISTICS DISCREPANCIES
children.push(h2("F4. Key Discrepancies — Supply Chain / Logistics"));

children.push(h3("F4.1 Route Performance Extremes"));
children.push(p("The gap between best and worst routes is enormous. Riyadh routes (HDRI*) average 3.6% cancel. Agency routes average 51.1% cancel. Worst HD routes: HDAB02 (28.5%), HDAB01 (24.3%), HDTF02 (23.5%). This suggests: agency route model is fundamentally broken, Abha/Taif regions have structural delivery problems, route capacity planning is not aligned with demand quality."));

children.push(h3("F4.2 COD Execution Risk"));
children.push(p("SAR 335M flows through COD annually. COD cancel rate (2.42%) is 1.5x non-COD (1.6%). In problem segments: call center COD cancel is 11.0%, agency routes are 42-92% cancel with 100% COD. COD creates operational exposure: truck loaded with unconfirmed orders, driver time wasted on cancels, cash handling risk, and zero upfront customer commitment."));

children.push(h3("F4.3 Delivery Timing Blind Spot"));
children.push(p("delivery_date (promised date) is 0% populated. actual_delivery_date is only 36% populated for delivered orders. This means: no SLA monitoring is possible, late delivery claims from MATLAB output (~9.8%) cannot be validated, delivery performance management lacks baseline data."));

// F5: SALES DISCREPANCIES
children.push(h2("F5. Key Discrepancies — Sales"));

children.push(h3("F5.1 Call Center Channel Quality"));
children.push(p("Call center (source_id=3) shows 11.0% cancel rate — the highest of any standard channel. 97.6% COD in January (declining to 52.5% by November). Volume growing from 1,398/month (Jan) to 4,001/month (Sep). Despite being a managed channel, call center produces worst-quality orders among standard sources."));

children.push(h3("F5.2 Salla Marketplace Integration Issues"));
children.push(p("Salla (source_id=14) shows 7-14% cancel rate since launch in May 2025. Volume grew from 122/month to 3,095/month. Cancel rate peaked at 13.8% in June. This suggests integration quality issues or marketplace customer behavior mismatch."));

children.push(h3("F5.3 Geographic Demand-Fulfillment Mismatch"));
children.push(p("2.52M no_service_area_logs suggest massive unfulfilled demand. Meanwhile, cities like Abha and Taif where service exists show 20-26% cancellation. This indicates: expansion into areas without adequate delivery infrastructure, sales pushing demand where logistics cannot fulfill, or customer acquisition in low-serviceability zones."));

// F6: DIGITAL CHANNEL DISCREPANCIES
children.push(h2("F6. Key Discrepancies — Digital Channels"));

children.push(h3("F6.1 WhatsApp Channel is a Fraud Vector"));
children.push(p("1,089 WhatsApp orders in 2025, 341 canceled (31.3%), 100% COD. Contains SAR 102.2M in fake orders. Even excluding fake orders, the channel shows: highest cancel rate (31.3%), lowest quality orders, no payment verification (all COD), no order value caps. This channel should be suspended or subject to mandatory pre-payment."));

children.push(h3("F6.2 iOS Dominance and March Vulnerability"));
children.push(p("iOS (source_id=8) is the largest digital channel: 527,752 orders, 5.73% cancel rate. In March 2025, iOS cancel rate spiked to 9.05% (from 3.22% baseline) — suggesting app-level issues or promotional campaign driving low-quality demand. iOS is the primary surface for any digital quality improvement."));

children.push(h3("F6.3 Driver App Data Paradox"));
children.push(p("Driver app (source_id=13) generates 1.36M orders (63.3% of all) but has near-zero cancel rate (0.19%). This is because driver_app orders are created at the point of delivery — the driver is already at the customer. These are fundamentally different from customer-initiated orders and should be segmented separately in all analytics. Combining them with customer orders deflates the true cancel rate."));

children.push(h3("F6.4 Source Attribution Gap"));
children.push(p("source_id has no reference table. The mapping (1=web, 3=call center, 8=ios, 9=android, 10=unknown, 11=whatsapp, 13=driver_app, 14=salla) is inferred from data patterns. No documentation or lookup table exists. This makes channel analytics dependent on tribal knowledge."));
children.push(pageBreak());

// ===========================================
// SECTION G: CONFIRMED FINDINGS TABLE
// ===========================================
children.push(h1("G. Confirmed Findings Table"));

children.push(makeTable(
  ["#", "Finding", "Class.", "Evidence", "Impact", "Root Cause", "Owner", "Conf.", "Priority"],
  [
    ["1", "WhatsApp SAR 102.2M fake orders", "Confirmed", "3 orders, source_id=11, all COD canceled", "SAR 102.2M fraud exposure", "No order value cap, no payment verification", "IT+Digital", "HIGH", "P0"],
    ["2", "Agency routes 42-92% cancel, 100% COD", "Confirmed", "9 routes, 1757 orders, 897 canceled", "51.1% waste rate on agency", "Agency model broken or fraudulent", "Sales+Logistics", "HIGH", "P0"],
    ["3", "delivery_date 0% populated", "Confirmed", "0 of 2.14M orders have delivery_date", "Late KPI impossible", "Field not populated by OMS", "IT", "HIGH", "P0"],
    ["4", "Cancel reason 72.7% = Other", "Confirmed", "34,161 of 47,018 cancels", "Root cause analysis impossible", "Only 5 reason codes, default = Other", "IT+Ops", "HIGH", "P1"],
    ["5", "CSV pipeline captures 29% of orders", "Confirmed", "677K vs 2.14M orders", "Management sees 1/3 of reality", "Pipeline excludes driver_app", "IT", "HIGH", "P1"],
    ["6", "ERP sync degradation 115%", "Confirmed", "0.93% → 2.00% missing erp_id", "Growing SAP reconciliation gap", "ERP integration degrading", "IT", "HIGH", "P1"],
    ["7", "March 2025 systemic crisis", "Confirmed", "3.48% cancel, 3.3x baseline", "~6,600 excess cancellations", "System-wide, cause unknown", "IT+Logistics", "HIGH", "P2"],
    ["8", "Abha/Taif/Madinah 20-26% cancel", "Confirmed", "47,510 orders, 22.7% of cancels", "10,675 wasted orders", "Regional delivery infrastructure gap", "Logistics", "HIGH", "P1"],
    ["9", "Call center 11% cancel rate", "Confirmed", "30,748 orders, 3,386 canceled", "Worst standard channel", "High COD %, poor order quality", "Sales", "MEDIUM", "P2"],
    ["10", "Near-zero referential integrity", "Confirmed", "Only 2 FKs across 212 tables", "Silent data corruption risk", "Schema design gap", "IT", "MEDIUM", "P2"],
    ["11", "preferred_date 0% populated", "Confirmed", "0 of 2.14M orders", "Requested date not tracked", "Field not used by OMS", "IT", "MEDIUM", "P2"],
    ["12", "actual_delivery_date 36% populated", "Confirmed", "776K of 2.14M orders", "Delivery timing limited", "Partial capture by driver app", "IT+Logistics", "MEDIUM", "P2"],
    ["13", "COD cancel 2.4% vs non-COD 1.6%", "Confirmed", "1.5M COD orders, 36K canceled", "SAR 8.7M in canceled COD value", "No upfront commitment", "Sales+Finance", "MEDIUM", "P2"],
    ["14", "Driver app = 63% of orders but excluded from CSV", "Confirmed", "1.36M orders at 0.19% cancel", "Massive analytical blind spot", "Pipeline filter design flaw", "IT", "HIGH", "P1"],
    ["15", "Salla 7-14% cancel rate", "Confirmed", "15,933 orders, 1,398 canceled", "Marketplace integration issues", "New channel, teething issues", "Digital+Sales", "MEDIUM", "P2"]
  ]
));
children.push(pageBreak());

// ===========================================
// SECTION H: TECHNICAL APPENDIX
// ===========================================
children.push(h1("H. Technical Appendix"));

children.push(h3("H1. Key SQL Queries Used"));
children.push(p("All queries executed against tania_omsdsdb01 via MySQL 9.6.0. Database contains 2,143,961 orders for Jan-Nov 2025."));

children.push(pBold("Q1: Total Population Count"));
children.push(p("SELECT COUNT(*) FROM orders WHERE created_at >= '2025-01-01' AND created_at < '2026-01-01'; → 2,332,250 (full year) / 2,143,961 (Jan-Nov)"));

children.push(pBold("Q2: Monthly KPI Aggregation"));
children.push(p("SELECT DATE_FORMAT(created_at, '%Y-%m'), COUNT(*), SUM(order_status_id=4), SUM(order_status_id=6), SUM(grand_total), SUM(payment_method='CASH_ON_DELIVERY')/COUNT(*) FROM orders WHERE created_at >= '2025-01-01' GROUP BY month"));

children.push(pBold("Q3: Route Analysis (via address path)"));
children.push(p("SELECT r.route_code, COUNT(*), SUM(o.order_status_id=6)/COUNT(*) FROM orders o JOIN addresses a ON o.shipping_address_id=a.address_id JOIN routes r ON a.route_id=r.route_id WHERE created_at >= '2025-01-01' GROUP BY route_code"));

children.push(pBold("Q4: WhatsApp Extreme Orders"));
children.push(p("SELECT order_id, grand_total, created_at, order_status_id FROM orders WHERE source_id='11' ORDER BY grand_total DESC LIMIT 20"));

children.push(pBold("Q5: Cancel Lifecycle Timing"));
children.push(p("SELECT CASE WHEN TIMESTAMPDIFF(MINUTE, created_at, status_cancelled) < 5 THEN '<5min' ... END, COUNT(*), AVG(grand_total) FROM orders WHERE order_status_id=6 AND status_cancelled IS NOT NULL GROUP BY cancel_speed"));

children.push(pBold("Q6: Field Population Analysis"));
children.push(p("SELECT COUNT(*), SUM(delivery_date IS NOT NULL), SUM(actual_delivery_date IS NOT NULL), SUM(erp_id IS NOT NULL AND erp_id != ''), SUM(preferred_date IS NOT NULL) FROM orders WHERE created_at >= '2025-01-01'"));

children.push(h3("H2. Metric Definitions"));
children.push(makeTable(
  ["Metric", "Definition", "Validated"],
  [
    ["Cancel Rate", "COUNT(order_status_id=6) / COUNT(*)", "Yes — DB 2.19%, CSV 4.26% (population differs)"],
    ["COD Share", "COUNT(payment_method='CASH_ON_DELIVERY') / COUNT(*)", "Yes — DB 69.8%, CSV 43.8%"],
    ["AOV", "SUM(grand_total) / COUNT(*)", "Yes — inflated by fake orders"],
    ["Missing ERP Rate", "COUNT(erp_id IS NULL AND delivered) / COUNT(delivered)", "Yes — DB 0.93-2.00%"],
    ["Late Rate", "CANNOT COMPUTE — delivery_date is 0% populated", "No"],
    ["Cancel Speed", "TIMESTAMPDIFF(MINUTE, created_at, status_cancelled)", "Yes — requires status_cancelled IS NOT NULL"]
  ]
));

children.push(h3("H3. Data Quality Checks That Should Exist"));
children.push(bullet("Daily: % orders with NULL delivery_date → should be 0%, currently 100%"));
children.push(bullet("Daily: % delivered orders with NULL erp_id → threshold: <1%, currently 1.84%"));
children.push(bullet("Daily: % cancellations with reason='Other' → threshold: <30%, currently 72.7%"));
children.push(bullet("Daily: orders with grand_total > SAR 50,000 → should trigger review, currently unchecked"));
children.push(bullet("Daily: routes with cancel_rate > 20% → should trigger alert, currently unmonitored"));
children.push(bullet("Daily: source_id=11 (WhatsApp) orders → should require pre-payment, currently all COD"));
children.push(pageBreak());

// ===========================================
// SECTION I: TOP 20 ISSUES
// ===========================================
children.push(h1("I. Top 20 Issues Ranked by Business Impact"));

children.push(makeTable(
  ["Rank", "Issue", "Revenue Impact", "Order Impact", "Confidence"],
  [
    ["1", "WhatsApp SAR 102.2M fake orders", "SAR 102.2M fraud exposure", "3 orders", "HIGH"],
    ["2", "Agency routes 51% cancel (100% COD)", "SAR 520K canceled value", "897 orders wasted", "HIGH"],
    ["3", "CSV pipeline misses 71% of orders", "All KPI reporting unreliable", "1.47M orders invisible", "HIGH"],
    ["4", "delivery_date 0% populated", "Late KPI non-functional", "2.14M orders affected", "HIGH"],
    ["5", "Cancel reason 72.7% = Other", "Root cause blind spot", "34,161 cancels undiagnosed", "HIGH"],
    ["6", "Abha/Taif/Madinah 20-26% cancel", "SAR ~2.8M canceled", "10,675 orders wasted", "HIGH"],
    ["7", "ERP sync degradation (0.93→2.0%)", "Growing SAP reconciliation gap", "29,010 missing links", "HIGH"],
    ["8", "March 2025 systemic crisis", "SAR ~1.1M excess cancels", "~4,900 excess cancels", "HIGH"],
    ["9", "COD 69.8% of orders, higher cancel", "SAR 8.7M COD cancels", "36,165 COD cancels", "MEDIUM"],
    ["10", "Call center 11% cancel rate", "SAR ~460K canceled", "3,386 canceled", "MEDIUM"],
    ["11", "Salla 8.77% cancel rate", "SAR ~330K canceled", "1,398 canceled", "MEDIUM"],
    ["12", "Near-zero referential integrity (2 FKs)", "Silent corruption risk", "212 tables unprotected", "MEDIUM"],
    ["13", "No analytical marts exist", "Manual analysis dependency", "All reporting affected", "MEDIUM"],
    ["14", "preferred_date 0% populated", "Requested date not tracked", "2.14M orders", "MEDIUM"],
    ["15", "actual_delivery_date 36% populated", "Delivery timing limited", "1.37M orders missing", "MEDIUM"],
    ["16", "source_id has no reference table", "Channel analytics fragile", "All orders affected", "MEDIUM"],
    ["17", "Driver app 63% of orders conflates metrics", "Cancel rate understated", "1.36M orders", "MEDIUM"],
    ["18", "47 empty tables in schema", "Maintenance overhead", "Schema bloat", "LOW"],
    ["19", "9 collations across tables", "Join failure risk", "212 tables affected", "LOW"],
    ["20", "27GB log table bloat", "Storage/performance cost", "3 tables", "LOW"]
  ]
));
children.push(pageBreak());

// ===========================================
// SECTION J: 30/60/90 DAY ACTION PLAN
// ===========================================
children.push(h1("J. 30 / 60 / 90 Day Action Plan"));

children.push(h2("30-Day Actions (Urgent)"));
children.push(makeTable(
  ["Action", "Owner", "Effort", "Category", "Expected Impact"],
  [
    ["Block WhatsApp orders >SAR 5K or require prepayment", "IT + Digital", "Low", "IT Control", "Eliminate SAR 102M+ fraud vector"],
    ["Audit all 9 agency routes — suspend if no legitimate business case", "Sales + Logistics", "Medium", "Logistics Process", "Stop 51% cancel waste on AG routes"],
    ["Expand cancel_reasons from 5 to 15+ with mandatory selection", "IT + Ops", "Low", "IT Control", "Enable root cause analysis for 72.7% of cancels"],
    ["Fix CSV pipeline to include source_id=13 (driver_app)", "IT", "Low", "Reporting/Pipeline", "Management sees 100% of orders instead of 29%"],
    ["Create dim_channel_standardized reference table", "IT", "Low", "Data Model", "Eliminate hardcoded source mappings"],
    ["Set up daily alert for orders >SAR 50K", "IT", "Low", "IT Control", "Catch future fake orders in real-time"]
  ]
));

children.push(h2("60-Day Actions (Important)"));
children.push(makeTable(
  ["Action", "Owner", "Effort", "Category", "Expected Impact"],
  [
    ["Populate delivery_date field in OMS", "IT", "Medium", "Data Model", "Enable late delivery KPI computation"],
    ["Investigate ERP sync degradation root cause", "IT", "Medium", "IT Control", "Reverse 115% increase in missing erp_id"],
    ["Build mart_monthly_ops_kpis automated table", "IT", "Medium", "Reporting/Pipeline", "Replace manual MATLAB CSV pipeline"],
    ["Build dim_geo_standardized with city/region mapping", "IT", "Medium", "Data Model", "Reliable geography analytics"],
    ["Deploy route-level cancel rate monitoring with 20% threshold alert", "IT + Logistics", "Medium", "IT Control", "Auto-detect route failures like JIAG01"],
    ["Investigate March 2025 crisis root cause", "IT + Logistics", "Medium", "Logistics Process", "Prevent recurrence"],
    ["Reduce COD dependency in problem cities (Abha, Taif, Makkah)", "Sales + Finance", "Medium", "Sales Process", "Reduce cancel rate in 20%+ cities"],
    ["Build dq_order_completeness_daily monitoring table", "IT", "Medium", "Data Quality", "Auto-detect field population regressions"]
  ]
));

children.push(h2("90-Day Actions (Strategic)"));
children.push(makeTable(
  ["Action", "Owner", "Effort", "Category", "Expected Impact"],
  [
    ["Build fact_order_lifecycle denormalized table", "IT", "High", "Data Model", "Enable self-service lifecycle analytics"],
    ["Build mart_route_monthly_scorecard", "IT", "Medium", "Reporting/Pipeline", "Automated route performance management"],
    ["Build mart_source_monthly_scorecard", "IT", "Medium", "Reporting/Pipeline", "Automated channel quality management"],
    ["Build mart_daily_anomalies with z-score logic", "IT", "Medium", "Reporting/Pipeline", "Replace MATLAB anomaly detection"],
    ["Add foreign key constraints to core tables", "IT", "High", "Data Model", "Enforce referential integrity"],
    ["Standardize collations across all 212 tables", "IT", "Medium", "Data Model", "Eliminate character set chaos"],
    ["Review call center order quality process", "Sales", "Medium", "Sales Process", "Reduce 11% cancel rate"],
    ["Build fact_payment_risk table", "IT + Finance", "Medium", "Data Model", "Formalize COD risk scoring"],
    ["Implement driver cash collection reconciliation layer", "IT + Finance", "High", "IT Control", "Control SAR 335M annual COD flow"],
    ["Clean up 47 empty tables and 27GB log bloat", "IT", "Low", "Data Model", "Reduce storage and maintenance overhead"]
  ]
));

// ============================================================
// GENERATE DOCUMENT
// ============================================================
const doc = new Document({
  sections: [{ children }],
  styles: {
    default: {
      document: { run: { font: "Helvetica Neue", size: 20 } }
    }
  }
});

Packer.toBuffer(doc).then(buffer => {
  const outPath = "/Users/m1/Desktop/DEJAN STARTUP SCHOOL/Dejan - ME Startup School/OMS_Full_Investigation_Report.docx";
  fs.writeFileSync(outPath, buffer);
  console.log("Report generated: " + outPath);
  console.log("Size: " + (buffer.length / 1024).toFixed(1) + " KB");
});
