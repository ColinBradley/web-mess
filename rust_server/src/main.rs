use std::io;

use actix_web::{web, App, Error, HttpRequest, HttpResponse, HttpServer};
use openssl::ssl::{SslAcceptor, SslFiletype, SslMethod};

async fn index(req: HttpRequest) -> Result<HttpResponse, Error> {
    let cache = req.app_data::<web::Data<MessServer>>().unwrap();
    Ok(HttpResponse::Ok()
        .content_type("text/html")
        .body(cache.index_body.clone()))
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
            }))
            .route("/", web::get().to(index))
            .service(actix_files::Files::new("/static", STATIC_FILES_LOCATION))
    })
    .bind_openssl("127.0.0.1:8445", builder)?
    .run()
    .await
}

struct MessServer {
    index_body: String,
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

    if let Some(js_path) = main_js_path {
        if let Some(css_path) = main_css_path {
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
                        <!--<test>
                            <button id="monaco-button">Monaco</button>
                            <div id="editor-container" class="container"></div>
                        </test>
                        <test>
                            <button id="babylon-button">Babylon</button>
                            <canvas id="3d-container" class="container"></canvas>
                        </test>--!>
                        <test>
                            <button id="trave-view-button">Trace View</button>
                            <canvas id="trace-test" class="container"></canvas>
                            <div id="trace-content"></div>
                        </test>
                    </tests>
                </body>

                </html>"#
                ));
        }
    }

    None
}
