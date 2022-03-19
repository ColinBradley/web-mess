#![feature(let_chains)]

use std::{collections::HashMap, io, path::Path};

use actix_web::{web, App, Error, HttpRequest, HttpResponse, HttpServer};
use openssl::ssl::{SslAcceptor, SslFiletype, SslMethod};

async fn index(req: HttpRequest) -> Result<HttpResponse, Error> {
    let cache = req.app_data::<web::Data<MessServer>>().unwrap();
    Ok(HttpResponse::Ok()
        .content_type("text/html")
        .body(cache.index_body.clone()))
}

async fn static_files(req: HttpRequest) -> Result<HttpResponse, Error> {
    let cache = req.app_data::<web::Data<MessServer>>().unwrap();
    let file_name = STATIC_FILES_LOCATION.to_owned() + req.match_info().query("filename");
    if let Some(file_content) = cache.static_files.get(&file_name) {
        let extension = Path::new(&file_name)
            .extension()
            .and_then(std::ffi::OsStr::to_str)
            .unwrap();
        let content_type = match extension {
            "js" => "application/javascript",
            "css" => "text/css",
            "ttf" => "font/ttf",
            _ => todo!(),
        };

        return Ok(HttpResponse::Ok()
            .content_type(content_type)
            .body(web::Bytes::from(file_content.clone())));
    }

    Ok(HttpResponse::NotFound().body(()))
}

#[actix_web::main]
async fn main() -> io::Result<()> {
    println!("Starting server: https://127.0.0.1:8445");

    let mut builder = SslAcceptor::mozilla_intermediate(SslMethod::tls()).unwrap();
    builder
        .set_private_key_file("../server/config/https.key", SslFiletype::PEM)
        .unwrap();
    builder
        .set_certificate_chain_file("../server/config/https.crt")
        .unwrap();

    HttpServer::new(|| {
        App::new()
            .wrap(actix_web::middleware::Compress::default())
            .app_data(web::Data::new(MessServer {
                index_body: get_index_html().unwrap(),
                static_files: get_static_files(),
            }))
            .route("/", web::get().to(index))
            // .service(web::resource("/static/{filename:.*}").to(static_files))
            .service(actix_files::Files::new("/static", STATIC_FILES_LOCATION))
    })
    .bind_openssl("127.0.0.1:8445", builder)?
    .run()
    .await
}

struct MessServer {
    index_body: String,
    static_files: HashMap<String, Vec<u8>>,
}

static STATIC_FILES_LOCATION: &str = "../server/www/static";

fn get_index_html() -> Option<String> {
    let mut main_js_path = None;
    let mut main_css_path = None;

    for path in std::fs::read_dir(STATIC_FILES_LOCATION).unwrap() {
        if let Ok(entry) = path {
            let name = entry.file_name().into_string().unwrap();
            if !name.starts_with("main-") {
                continue;
            }

            if name.ends_with(".js") {
                main_js_path = Some(name);
            } else if name.ends_with(".css") {
                main_css_path = Some(name);
            }
        }
    }

    if let Some(js_path) = main_js_path && let Some(css_path) = main_css_path {
        return Some(format!(
            r#"<!DOCTYPE html>
            <html lang="en">
            
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Actix testing</title>
                <script src="/static/{js_path}" type="module" async></script>
                <link rel="stylesheet" href="/static/{css_path}">
            </head>
            
            <body>
                <h1>Hello</h1>
                <tests>
                    <test>
                        <button id="monaco-button">Monaco</button>
                        <div id="editor-container" class="container" style="background-color: rgb(66, 106, 146);"></div>
                    </test>
                    <test>
                        <button id="babylon-button">Babylon</button>
                        <canvas id="3d-container" class="container" style="background-color: rgb(65, 129, 70);">
                    </test>
                </tests>
            </body>
            
            </html>"#
        ));
    }

    None
}

fn get_static_files() -> HashMap<String, Vec<u8>> {
    let mut result = HashMap::<String, Vec<u8>>::new();
    _ = visit_dirs(Path::new(STATIC_FILES_LOCATION), &mut result);
    result
}

fn visit_dirs(dir: &Path, content_map: &mut HashMap<String, Vec<u8>>) {
    for entry in std::fs::read_dir(dir).unwrap() {
        let path = entry.unwrap().path();
        if path.is_dir() {
            visit_dirs(&path, content_map);
        } else {
            content_map.insert(
                String::from(path.to_str().unwrap()),
                std::fs::read(path).unwrap(),
            );
        }
    }
}
