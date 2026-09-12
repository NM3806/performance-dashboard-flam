# Performance-Critical Data Visualization Dashboard

A high-performance real-time data visualization dashboard built with Next.js App Router, TypeScript, and the HTML5 Canvas API.

## Design Approach

The dashboard follows a "Swiss information design" and "engineering instrument panel" philosophy. 
- **Colors:** Minimalist palette with high contrast, primarily using grays, blacks, and off-whites. Colors are reserved exclusively for data categories to ensure they stand out.
- **Typography:** Uses Inter for UI elements and IBM Plex Mono for all data points and axis labels to align numbers properly and convey precision.
- **Layout:** A grid-based, dense layout that maximizes data visibility on the screen while remaining clear and structured.

## Architecture

To handle 10,000+ data points at 60 frames per second without crashing or lagging, the app separates **React State** from **Mutable Data**.

- **Mutable Refs for Data:** The actual stream of data points is stored in a `React.MutableRefObject`. When new data arrives (every 100ms), it is pushed directly into this array. This avoids triggering a React re-render for every single data point.
- **Controlled Re-renders:** A `dataVersion` integer is kept in React state. The data stream hook increments this version only every 500ms. This tells the React component tree to update and redraw the charts, batching the visual updates.
- **Server and Client Components:** The Next.js App Router is used effectively. The layout and API are server-side, while the charts and controls are Client Components (`'use client'`) since they require browser APIs like Canvas and real-time interaction.

## Performance Strategies

1. **Canvas Rendering:** Standard DOM elements (like SVG or div bars) would overwhelm the browser with 10,000 nodes. Using the Canvas API allows us to draw thousands of points on a single DOM element.
2. **Pixel-Level Downsampling:** The line chart avoids drawing invisible detail. If 50 data points all map to the exact same X and Y pixel coordinate, the chart only draws a line to that pixel once.
3. **Off-screen Culling:** When zooming or panning, the charts calculate if a point is outside the visible area and skip drawing it entirely.
4. **Data Batching and Sliding Windows:** The data array removes the oldest points when it exceeds the target load (e.g., 10,000 points) to prevent memory leaks and infinite array growth over time.
5. **Virtual Scrolling:** The data table uses virtual scrolling. Even if there are 50,000 rows in memory, it only renders the ~20 rows currently visible on the screen plus a small buffer.
6. **Request Animation Frame (rAF):** The chart renderer uses `requestAnimationFrame` to ensure drawing only happens when the browser is ready for the next frame, preventing redundant drawing calculations.

## How to Run

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

3. **View the dashboard:**
   Open [http://localhost:3000/dashboard](http://localhost:3000/dashboard) in your browser.

4. **Production Build:**
   For the best performance, test the app using the production build:
   ```bash
   npm run build
   npm run start
   ```
