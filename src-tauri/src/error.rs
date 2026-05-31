use serde::{Serialize, Serializer};

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("io error: {0}")]
    Io(#[from] std::io::Error),
    #[error("serde error: {0}")]
    Serde(#[from] serde_json::Error),
    #[error("scan cancelled")]
    Cancelled,
    #[error("not found: {0}")]
    NotFound(String),
    #[error("invalid argument: {0}")]
    Invalid(String),
    #[error("other: {0}")]
    Other(String),
}

impl Serialize for Error {
    fn serialize<S: Serializer>(&self, s: S) -> std::result::Result<S::Ok, S::Error> {
        let code = match self {
            Error::Io(_) => "io",
            Error::Serde(_) => "serde",
            Error::Cancelled => "cancelled",
            Error::NotFound(_) => "not_found",
            Error::Invalid(_) => "invalid",
            Error::Other(_) => "other",
        };
        use serde::ser::SerializeMap;
        let mut m = s.serialize_map(Some(2))?;
        m.serialize_entry("code", code)?;
        m.serialize_entry("message", &self.to_string())?;
        m.end()
    }
}

pub type Result<T> = std::result::Result<T, Error>;
