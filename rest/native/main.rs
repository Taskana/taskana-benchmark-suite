use async_std::task;
use neon::prelude::*;
use once_cell::sync::OnceCell;
use reqwest::header::{HeaderMap, HeaderValue};
use std::collections::HashMap;
use std::time::Duration;
use tokio::runtime::Runtime;

/// Static singleton generator for creating or obtaining a new
/// Tokio runtime for asynchronous work.
///
/// The returned runtime is encapsuled inside a NeonResult wrapper
/// for throwing exceptions inside of Node.js e.g. to reject promises.
///
/// Creating a runtime requires a Neon FFI libuv context.
///
/// # Examples
///
/// ```rust
/// let rt = runtime(&mut cx)?;
///
/// rt.spawn(async move {
///     // Asynchronous code executed on a Tokio runtime
/// });
/// ```
fn runtime<'a, C: Context<'a>>(cx: &mut C) -> NeonResult<&'static Runtime> {
    static RUNTIME: OnceCell<Runtime> = OnceCell::new();

    RUNTIME.get_or_try_init(|| Runtime::new().or_else(|err| cx.throw_error(err.to_string())))
}

/// Static singleton generator for creating or obtaining a new
/// `Reqwest::Client` instance for making asynchronous HTTP requests.
///
/// # Examples
///
/// ```rust
/// let http = client();
///
/// http.request(reqwest::Method::GET, 'http://localhost/api/hello')
///     .send()
///     .await?
///     .text()
///     .await?;
/// ```
fn client() -> &'static reqwest::Client {
    static CLIENT: OnceCell<reqwest::Client> = OnceCell::new();

    CLIENT.get_or_init(|| reqwest::Client::new())
}

/// Simple matcher function for matching HTTP verbs.
///
/// For simplicity's sake requests throughout this library
/// can be built by providing HTTP verbs by string. In order
/// to use them with `reqwest` they first need to be matched
/// to a `reqwest::Method` constant.
///
/// # Examples
///
/// ```rust
/// let verb: reqwest::Method = get_method('POST');
/// ```
fn get_method(str_method: &str) -> reqwest::Method {
    match str_method {
        "GET" => reqwest::Method::GET,
        "POST" => reqwest::Method::POST,
        "PUT" => reqwest::Method::PUT,
        "DELETE" => reqwest::Method::DELETE,
        "HEAD" => reqwest::Method::HEAD,
        "TRACE" => reqwest::Method::TRACE,
        "CONNECT" => reqwest::Method::CONNECT,
        "PATCH" => reqwest::Method::PATCH,
        "OPTIONS" => reqwest::Method::OPTIONS,
        _ => reqwest::Method::GET,
    }
}

/// Simple converter function for obtaining a static reference
/// to a `String` typed string for safe use between threads.
///
/// # Examples
///
/// ```rust
/// let s: String = "Hello World";
/// let s_ref: &str = get_static_string_reference(s);
/// ```
fn get_static_string_reference(s: String) -> &'static str {
    Box::leak(s.into_boxed_str())
}

/// Request wrapper function for obtaining a `Reqwest::Client`
/// singleton instance and building the request asynchronously.
///
/// Both the URL and the HTTP method can be passed as a str reference
/// for simplicity and gets matched to the right constant by the
/// [`get_method`] matcher function.
///
/// # Examples
///
/// Usage within a Rust function with access to a FunctionContext
///
/// ```rust
/// let url = cx.argument::<JsString>(0)?.value(&mut cx);
/// let method = cx.argument::<JsString>(1)?.value(&mut cx);
///
/// let data = request_handler(&method, &url).await;
/// ```
async fn request_handler(method: &str, url: &str, headers: &str) -> Result<String, reqwest::Error> {
    let http = client();
    let deserialized_headers: HashMap<String, serde_json::Value> =
        serde_json::from_str(headers).unwrap();

    let mut request_headers = HeaderMap::new();

    for (header, value) in deserialized_headers {
        request_headers.insert(
            get_static_string_reference(header),
            HeaderValue::from_str(value.as_str().unwrap()).unwrap(),
        );
    }

    let data = http
        .request(get_method(method), url)
        .headers(request_headers)
        .send()
        .await?
        .text()
        .await?;

    Ok(data)
}

/// Request function for making native HTTP requests.
///
/// This function through its function context reads a request URL
/// and an HTTP method to dynamically invoke a `Reqwest::Client`
/// request builder wrapped in the [`request_handler`] function.
///
/// # Examples
///
/// Usage from within Node.js
///
/// ```js
/// const { makeRequest } = require('./index.nodee');
///
/// makeRequest('http://localhost/api/hello', 'GET', { Authorization: 'Basic abc' })
///     .then((data) => console.log(JSON.parse(data)));
/// ```
fn make_request(mut cx: FunctionContext) -> JsResult<JsPromise> {
    let rt = runtime(&mut cx)?;
    let url = cx.argument::<JsString>(0)?.value(&mut cx);
    let method = cx.argument::<JsString>(1)?.value(&mut cx);
    let headers = cx.argument::<JsString>(2)?.value(&mut cx);
    let channel = cx.channel();
    let (deferred, promise) = cx.promise();

    rt.spawn(async move {
        let data = request_handler(&method, &url, &headers).await;

        deferred.settle_with(&channel, move |mut cx| {
            let data = data.or_else(|err| cx.throw_error(err.to_string()))?;

            match data {
                _ => Ok(cx.string(data)),
            }
        });
    });

    Ok(promise)
}

/// Warmup function to prime the libuv bindings for Node.js.
///
/// This also instantiates a new singleton HTTP client in order
/// to have a `Reqwest::Client` reference readily available for
/// when the `make_request` function is invoked from Node.js.
///
/// # Examples
///
/// Usage from within Node.js
///
/// ```js
/// const { warmup } = require('./index.node');
///
/// warmup(5).then(() => console.log('Primed and ready to go!'));
/// ```
fn warmup_libuv_ffi(mut cx: FunctionContext) -> JsResult<JsPromise> {
    let _http = client();
    let rt = runtime(&mut cx)?;
    let wait_time = cx.argument::<JsNumber>(0)?.value(&mut cx);
    let channel = cx.channel();
    let (deferred, promise) = cx.promise();

    rt.spawn(async move {
        task::sleep(Duration::from_secs(wait_time as u64)).await;

        deferred.settle_with(&channel, move |mut cx| -> JsResult<JsBoolean> {
            Ok(cx.boolean(true))
        });
    });

    Ok(promise)
}

/// Main function for registering native functions to the FFI
#[neon::main]
fn main(mut cx: ModuleContext) -> NeonResult<()> {
    cx.export_function("warmup", warmup_libuv_ffi)?;
    cx.export_function("makeRequest", make_request)?;

    Ok(())
}
