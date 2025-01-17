# Barrier Games

Interactive barrier trading game simulations with two variants:
- Converging Relative: Barriers move relative to the current price
- Converging Absolute: Barriers move with fixed absolute values

## Play the Games

The games are hosted on GitHub Pages. You can access them at:
- Main Page: https://matthewchan.github.io/Accumulator-variants/
- Converging Relative: https://matthewchan.github.io/Accumulator-variants/converging-relative/
- Converging Absolute: https://matthewchan.github.io/Accumulator-variants/converging-absolute/

## Project Structure

```
.
├── index.html          # Main landing page
├── converging-relative/
│   ├── index.html     # Relative variant game
│   ├── style.css      # Relative variant styles
│   └── script.js      # Relative variant logic
└── converging-absolute/
    ├── index.html     # Absolute variant game
    ├── style.css      # Absolute variant styles
    └── script.js      # Absolute variant logic
```

## Technologies Used

- HTML5 for structure
- CSS3 for styling
- JavaScript for game logic
- Chart.js for price visualization

## GitHub Pages Setup

The site is configured to be served from the root directory of the main branch. To enable GitHub Pages:

1. Go to your repository settings
2. Navigate to the "Pages" section
3. Under "Source", select the main branch
4. Set the root directory (/) as the publishing source
5. Click Save

The site will be available at: https://[your-username].github.io/Accumulator-variants/
