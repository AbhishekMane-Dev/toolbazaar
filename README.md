# ToolBazaar

**35 free, privacy-first browser tools for photos, PDFs, video, audio, design, and developer workflows.**

ToolBazaar is a static, client-side utility hub. Files are processed in the browser and are not uploaded to a ToolBazaar server. The app is designed to work as an installable Progressive Web App and supports hosting from a GitHub Pages project subdirectory.

## Try it

- **Live app:** https://rushisnap.github.io/toolbazaar/
- **Source:** https://github.com/Rushisnap/toolbazaar

## Tools

- **Photo:** filters, image resizing and batch compression, cropping, format conversion, EXIF inspection/removal, and AI background removal.
- **PDF:** image-to-PDF, merge, split, watermarking, and AES-256 password protection.
- **Video:** trimming, poster frame capture, GIF conversion, screen recording, and media conversion.
- **Audio:** audio studio, trimming, and text-to-speech.
- **Developer & text:** text utilities, CSV preview, text comparison, JSON formatting, Base64, password generation, Markdown editing, JWT decoding, file hashes, and regex testing.
- **Color & design:** color picker, palette generation, CSS gradients, and SVG optimization.
- **QR & barcode:** QR code and barcode generation.

Tools that use browser-native APIs or optional WebAssembly models may have browser, device, memory, or first-download requirements. Screen capture requires user permission and a secure context. The app's file-processing tools do not send selected files to a project server.

## Run locally

Serve the project directory over HTTP (service workers do not work from `file://`):

```powershell
python -m http.server 8000
```

Open `http://localhost:8000/`. For a production deployment, GitHub Pages publishes the root directory using the workflow in `.github/workflows/pages.yml`.

Most features work without an account. Some third-party libraries and AI/WASM assets must be downloaded from their CDNs once; the service worker caches dependencies when available. External library/model licensing and CDN availability apply.

## Contributing

Bug reports, accessibility improvements, documentation, and focused tool enhancements are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening an issue or pull request. By participating, contributors agree their contributions are licensed under the [MIT License](LICENSE).

## License

This project is released under the [MIT License](LICENSE).
