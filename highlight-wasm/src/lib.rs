use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn run(text: &str) -> String {
    let mut result = String::with_capacity(text.len() * 2);
    let mut code = String::new();

    let mut text = text.chars();
    let mut tag_code = false;

    while let Some(i) = text.next() {
        match i {
            '<' => {
                let (is_tag, tag) = tag(&mut text);
                match (tag_code, is_tag, tag.as_str()) {
                    (false, false, x) => { result += "<"; result += x; result.push(' '); },
                    (true, false, x) => { code += "<"; code += x; code.push(' '); },
                    (false, true, "dart") => {
                        text.next();
                        result += "<pre class='themable'><code>";
                        tag_code = true;
                    },
                    (true, true, "/dart") => {
                        result += &tokenize(code);
                        result += "</code></pre>";
                        code = String::new();
                        tag_code = false;
                    }
                    (false, true, x) => { result.push('<'); result += x; result.push('>'); },
                    (true, true, x) => { code.push('<'); code += x; code.push('>'); },
                }
            }
            _ if tag_code => code.push(i),
            _ => result.push(i),
        }
    }
    result
}

fn tag(code: &mut std::str::Chars) -> (bool, String) {
    let mut result = String::new();
    while let Some(i) = code.next() {
        match i {
            '>' => return (true, result),
            i if !i.is_alphanumeric() && i != '/' => return (false, result),
            _ => result.push(i),
        }
    }

    (false, result)
}

fn tokenize(code: String) -> String {
    let mut result = String::with_capacity(code.len() * 2);

    //comment, single-string, double-string
    let mut tags = [false; 3];
    let mut start = 0;

    let mut i = 0;
    while i < code.len() {
        match &code[i..i+1] {
            "<" if tags[0] => { result += &code[start..i]; result += "&lt;"; start = i + 1; },
            
            //COMMENTS
            "\n" if tags[0] => {
                result += &code[start..i]; result += "</span>";
                tags[0] = false; start = i;
            },
            _ if tags[0] => {},
            "/" if !tags[0] && &code[i..i+2] == "//" => {
                result += &code[start..i]; result += "<span class='themable comment'>";
                tags[0] = true; start = i;
            },

            //STRINGS
            "'" if tags[1] => {
                result += &code[start..i]; result += "'</span>";
                tags[1] = false; start = i+1;
            },
            "\"" if tags[2] => {
                result += &code[start..i]; result += "\"</span>";
                tags[2] = false; start = i+1;
            },
            "'" => {
                result += &code[start..i]; result += "<span class='themable string'>";
                tags[1] = true; start = i;
            },
            "\"" => {
                result += &code[start..i]; result += "<span class='themable string'>";
                tags[2] = true; start = i;
            },
            _ if tags[1] || tags[2] => {},

            //OPERATORS
            " " | "\n" => {
                tokenize_word(&code, &mut result, start, i, "variable");
                result += &code[i..i+1];
                start = i + 1;
            },
            "{" | "}" | "[" | "]" | ")" | "." | "," | ">" | "+" | "-" | "*" | "/" | "=" | ";" => {
                tokenize_word(&code, &mut result, start, i, "variable");
                result += "<span class='themable operator'>";
                result += &code[i..i+1];
                result += "</span>";

                start = i + 1;
            },
            "(" => {
                tokenize_word(&code, &mut result, start, i, "function");
                result += "<span class='themable operator'>";
                result += &code[i..i+1];
                result += "</span>";

                start = i + 1;
            },
            "<" => {
                tokenize_word(&code, &mut result, start, i, "variable");
                result += "<span class='themable operator'>&lt;</span>";
                start = i + 1;
            },
            _ => {}
        }
        i += 1;
    }
    result += &code[start..i];

    result
}

fn tokenize_word(code: &str, result: &mut String, start: usize, i: usize, class: &str) {

    if start < i {
        let word = &code[start..i];
        let first = word.chars().next().unwrap();
        if first.is_uppercase() { *result += "<span class='themable class'>"; }
        else {
            match word {
                "if" | "else" | "while" | "void" | "class" | "extends" | "for" | "this" | "return" | "in" => *result += "<span class='themable keyword'>",
                "bool" | "int" | "double" => *result += "<span class='themable class'>",
                "true" | "false" | "@override" => *result += "<span class='themable literal'>",
                _ if word.chars().all(char::is_numeric) => *result += "<span class='themable literal'>",
                _ => { *result += "<span class='themable "; *result += class; *result += "'>"; }
            }
        }
        *result += word;
        *result += "</span>";
    }
}
