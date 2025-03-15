import Types "types";
import Text "mo:base/Text";

func key(t: Text) : Types.Key<Text> { { hash = Text.hash t; key = t } };